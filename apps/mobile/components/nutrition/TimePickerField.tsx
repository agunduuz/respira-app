import { Clock } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { Button, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette, touchTarget } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const pad2 = (n: number) => String(n).padStart(2, "0");

interface Props {
  label: string;
  /** "HH:MM", 24 saat. */
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string | null;
}

/**
 * "HH:MM" serbest metin yerine dokunarak seçilen bir saat/dakika ızgarası —
 * hem format hatasını (rastgele metin girme) hem de klavyenin ekranın alt
 * kısmındaki alanları kapatma sorununu ortadan kaldırıyor (bkz. WaterGoalScreen).
 */
export function TimePickerField({ label, value, onChange, hint, error }: Props) {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;
  const [open, setOpen] = useState(false);

  const [h, m] = value.split(":").map((n) => Number(n));
  const hour = Number.isFinite(h) ? h : 8;
  const minute = Number.isFinite(m) ? m : 0;

  function pick(nextHour: number, nextMinute: number) {
    onChange(`${pad2(nextHour)}:${pad2(nextMinute)}`);
  }

  return (
    <View className="gap-2">
      <Text variant="label" muted>
        {label.toLocaleUpperCase("tr-TR")}
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{ minHeight: touchTarget.min }}
        className={cn(
          "flex-row items-center justify-between rounded-md border bg-surface px-4",
          error ? "border-danger" : "border-border-strong"
        )}
      >
        <Text variant="data">{value}</Text>
        <Clock size={18} strokeWidth={1.75} color={rgb(palette.textMuted)} />
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
          <View className="items-center gap-1">
            <Text variant="label" muted>
              {label.toLocaleUpperCase("tr-TR")}
            </Text>
            <Text variant="displayLg">{`${pad2(hour)}:${pad2(minute)}`}</Text>
          </View>

          <View className="flex-row gap-3" style={{ height: 200 }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="gap-1.5 pr-1">
                {HOURS.map((hh) => (
                  <TimeCell key={hh} label={pad2(hh)} selected={hh === hour} onPress={() => pick(hh, minute)} />
                ))}
              </View>
            </ScrollView>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="gap-1.5 pl-1">
                {MINUTES.map((mm) => (
                  <TimeCell key={mm} label={pad2(mm)} selected={mm === minute} onPress={() => pick(hour, mm)} />
                ))}
              </View>
            </ScrollView>
          </View>

          <Button title="Tamam" onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

function TimeCell({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{ minHeight: touchTarget.min - 8 }}
      className={cn(
        "items-center justify-center rounded-md border",
        selected ? "border-accent bg-accent" : "border-border bg-elevated"
      )}
    >
      <Text variant="data" className={selected ? "text-on-accent" : "text-text"}>
        {label}
      </Text>
    </Pressable>
  );
}
