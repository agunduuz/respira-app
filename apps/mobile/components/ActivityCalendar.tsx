import { HABITS_PER_DAY, completedHabits, type ActivityDay } from "@respira/shared-types";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

const WEEKDAY_LABELS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];
const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** "2026-09" → "Eylül 2026" */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayKey(month: string, day: number): string {
  return `${month}-${String(day).padStart(2, "0")}`;
}

interface Props {
  month: string;
  days: readonly ActivityDay[];
  waterTargetMl: number | null;
  selected: string | null;
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
}

/**
 * Ay görünümü: her gün, o gün tamamlanan alışkanlık sayısına göre doluyor
 * (0-4). Amaç tek bakışta "hangi günler kendime vakit ayırmışım" sorusuna
 * cevap vermek — rakamlarla değil, doluluğun ritmiyle.
 */
export function ActivityCalendar({
  month,
  days,
  waterTargetMl,
  selected,
  onSelect,
  onMonthChange,
}: Props) {
  const palette = usePalette();
  const [year, monthNo] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNo, 0).getDate();

  // Pazartesi haftanın ilk günü (TR) — JS'te 0 Pazar olduğu için kaydırıyoruz.
  const firstWeekday = (new Date(year, monthNo - 1, 1).getDay() + 6) % 7;

  const byDate = new Map(days.map((d) => [d.date, d]));
  const today = currentMonth();
  const isFuture = month >= today;

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Önceki ay"
          hitSlop={8}
          onPress={() => onMonthChange(shiftMonth(month, -1))}
          className="p-1"
        >
          <ChevronLeft size={20} strokeWidth={1.75} color={rgb(palette.text)} />
        </Pressable>
        <Text variant="subhead">{monthLabel(month)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sonraki ay"
          accessibilityState={{ disabled: isFuture }}
          disabled={isFuture}
          hitSlop={8}
          onPress={() => onMonthChange(shiftMonth(month, 1))}
          className="p-1"
          style={{ opacity: isFuture ? 0.3 : 1 }}
        >
          <ChevronRight size={20} strokeWidth={1.75} color={rgb(palette.text)} />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((w) => (
          <View key={w} className="flex-1 items-center">
            <Text variant="label" muted>
              {w}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, i) => {
          if (day === null) return <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, height: 44 }} />;

          const date = dayKey(month, day);
          const entry = byDate.get(date);
          const done = entry ? completedHabits(entry, waterTargetMl) : 0;
          const ratio = done / HABITS_PER_DAY;
          const isSelected = selected === date;

          return (
            <View key={date} style={{ width: `${100 / 7}%`, height: 44 }} className="items-center justify-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${day} ${monthLabel(month)}: ${done} / ${HABITS_PER_DAY} tamamlandı`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(date)}
                hitSlop={4}
                className={cn(
                  "items-center justify-center rounded-full",
                  isSelected && "border border-accent"
                )}
                style={{ width: 36, height: 36 }}
              >
                {/* Doluluk aksan renginin opaklığıyla anlatılıyor; rakam her zaman okunur kalsın diye
                    tam dolu günlerde metin rengi ters çevriliyor. */}
                <View
                  className="absolute rounded-full bg-accent"
                  style={{ width: 32, height: 32, opacity: ratio === 0 ? 0 : 0.18 + ratio * 0.82 }}
                />
                <Text
                  variant="bodySm"
                  muted={done === 0}
                  style={ratio >= 0.75 ? { color: rgb(palette.onAccent) } : undefined}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
