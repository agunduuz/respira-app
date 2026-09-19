import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { Button, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
/** getDay() Pazar'ı 0 sayar; takvimi Pazartesi'yle başlatmak için kaydırıyoruz. */
const firstWeekdayIndex = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7;

interface Props {
  label: string;
  /** "" ya da "YYYY-MM-DD". */
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
  hint?: string;
  error?: string | null;
}

/**
 * docs/04: son kan tahlili tarihi serbest metinle girildiğinde kullanıcı
 * "YYYY-AA-GG" formatını bozabiliyordu (harf girme dahil). Bunun yerine
 * yalnızca geçerli, gelecekte olmayan bir takvim günü seçtiren bir alt sayfa.
 */
export function DatePickerField({ label, value, onChange, optional, hint, error }: Props) {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const [open, setOpen] = useState(false);

  const today = new Date();
  const initial = value ? new Date(`${value}T00:00:00`) : today;
  const [viewY, setViewY] = useState(initial.getFullYear());
  const [viewM, setViewM] = useState(initial.getMonth());

  function openPicker() {
    const base = value ? new Date(`${value}T00:00:00`) : today;
    setViewY(base.getFullYear());
    setViewM(base.getMonth());
    setOpen(true);
  }

  function prevMonth() {
    if (viewM === 0) { setViewM(11); setViewY((y) => y - 1); } else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (atMaxMonth) return;
    if (viewM === 11) { setViewM(0); setViewY((y) => y + 1); } else setViewM((m) => m + 1);
  }

  const atMaxMonth = viewY === today.getFullYear() && viewM === today.getMonth();
  const dim = daysInMonth(viewY, viewM);
  const offset = firstWeekdayIndex(viewY, viewM);
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];

  const displayValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <View className="gap-2">
      <View className="flex-row items-baseline gap-2">
        <Text variant="label" muted>
          {label.toLocaleUpperCase("tr-TR")}
        </Text>
        {optional ? (
          <Text variant="label" muted>
            opsiyonel
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{ minHeight: touchTarget.min }}
        className={cn(
          "flex-row items-center justify-between rounded-md border bg-surface px-4",
          error ? "border-danger" : "border-border-strong"
        )}
      >
        <Text variant="data" className={displayValue ? "text-text" : "text-text-muted"}>
          {displayValue ?? "Tarih seç"}
        </Text>
        <Calendar size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
      </Pressable>

      {hint ? (
        <Text variant="bodySm" muted>
          {hint}
        </Text>
      ) : null}
      {error ? (
        <Text variant="bodySm" className="text-danger">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setOpen(false)}
        />
        <View
          className="gap-4 rounded-t-xl border-t border-border bg-surface p-4"
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => setOpen(false)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Kapat">
              <X size={20} strokeWidth={1.75} color={rgb(palette.textMuted)} />
            </Pressable>
            <Text variant="title">{label}</Text>
            <View style={{ width: 20 }} />
          </View>

          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={prevMonth}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Önceki ay"
              style={{ width: touchTarget.min, height: touchTarget.min, alignItems: "center", justifyContent: "center" }}
            >
              <ChevronLeft size={20} strokeWidth={1.75} color={rgb(palette.text)} />
            </Pressable>
            <Text variant="label">
              {MONTHS[viewM]} {viewY}
            </Text>
            <Pressable
              onPress={nextMonth}
              disabled={atMaxMonth}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Sonraki ay"
              style={{
                width: touchTarget.min,
                height: touchTarget.min,
                alignItems: "center",
                justifyContent: "center",
                opacity: atMaxMonth ? 0.3 : 1,
              }}
            >
              <ChevronRight size={20} strokeWidth={1.75} color={rgb(palette.text)} />
            </Pressable>
          </View>

          <View className="flex-row">
            {WEEKDAYS.map((w) => (
              <View key={w} style={{ width: `${100 / 7}%` }} className="items-center py-1">
                <Text variant="label" muted>
                  {w}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {cells.map((day, i) => {
              if (day === null) {
                return <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, height: 44 }} />;
              }
              const key = toKey(viewY, viewM, day);
              const selected = key === value;
              const future = atMaxMonth && day > today.getDate();
              return (
                <View key={key} style={{ width: `${100 / 7}%`, height: 44 }} className="items-center justify-center">
                  <Pressable
                    disabled={future}
                    onPress={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${day} ${MONTHS[viewM]} ${viewY}`}
                    accessibilityState={{ selected, disabled: future }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? rgb(palette.accent) : "transparent",
                      opacity: future ? 0.3 : 1,
                    }}
                  >
                    <Text variant="data" className={selected ? "text-on-accent" : "text-text"}>
                      {day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {value ? (
            <Button
              title="Tarihi temizle"
              variant="ghost"
              onPress={() => {
                onChange("");
                setOpen(false);
              }}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
