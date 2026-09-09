import type { NotificationCategory } from "@respira/shared-types";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { computeTriggerTimes, type QuietHours } from "./notification-schedule";

/**
 * docs/08-BILDIRIM-MIMARISI.md — tüm özelliklerin paylaştığı bildirim katmanı.
 *
 * NEDEN TEKRARLAYAN TRIGGER DEĞİL:
 * docs/08'deki taslak `{ seconds, repeats: true }` kullanıyor. Bu tetikleyici
 * sessiz saatleri atlayamaz — işletim sistemi sabit aralıkla tetikler, gece
 * 03:00'te de çalar. Sessiz saatler doc'un kabul kriterlerinden biri olduğu
 * için bunun yerine ileriye dönük ayrık tarihler planlıyoruz: sessiz pencereye
 * düşenler atlanıyor.
 *
 * BÜTÇE: iOS'ta uygulama başına en fazla 64 bekleyen local bildirim var.
 * Kategori başına sınır koyuyoruz ki bir özellik diğerlerinin yerini yemesin.
 */
const MAX_PENDING_PER_CATEGORY = 24;

export {
  DEFAULT_QUIET_HOURS,
  computeTriggerTimes,
  findMissedTriggers,
  isQuiet,
  type QuietHours,
} from "./notification-schedule";

/** Bir kategoriye ait bekleyen bildirimleri iptal eder, diğerlerine dokunmaz. */
export async function cancelCategory(category: NotificationCategory): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.content.data?.category === category)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Sistem izni. docs/08: her özellik kendi anında ister, açılışta toplu değil.
 * Reddedilirse uygulama çökmez — çağıran taraf false alır ve kullanıcıyı
 * uygulama içinde bilgilendirir.
 */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export interface ScheduleParams {
  category: NotificationCategory;
  title: string;
  body: string;
  intervalSeconds: number;
  quietHours?: QuietHours | null;
  /** Bildirime dokunulduğunda hangi ekranın açılacağı gibi ek veriler. */
  data?: Record<string, unknown>;
}

/**
 * Bir kategorinin planını sıfırlayıp yeniden kurar.
 * Ayar değiştiğinde (ör. 20 dk → 15 dk) bu fonksiyon tekrar çağrılır.
 *
 * @returns planlanan tetikleme zamanları — istemci bunları saklayıp kaçırılan
 *          molaları tespit etmek için kullanır.
 */
export async function scheduleRepeatingReminder(params: ScheduleParams): Promise<Date[]> {
  const { category, title, body, intervalSeconds, quietHours, data } = params;

  await cancelCategory(category);

  const times = computeTriggerTimes({
    from: new Date(),
    intervalSeconds,
    count: MAX_PENDING_PER_CATEGORY,
    quietHours,
  });

  for (const date of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { ...data, category },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }

  return times;
}

/**
 * Android'de bildirim kanalı tanımlanmazsa bildirimler sessiz gelir.
 * Uygulama açılışında bir kez çağrılır.
 */
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("respira-reminders", {
      name: "Hatırlatmalar",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}
