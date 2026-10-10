import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";

import { Text } from "@/components/ui";
import { useHueStore } from "@/theme/hue-store";
import { HUE_GRADIENT_STOPS, HUE_PRESETS, hueName, swatchColor } from "@/theme/tones";
import { rgb, usePalette } from "@/theme/use-palette";

const TONE_STRIP = ["t50", "t100", "t200", "t300", "t400", "t500", "t600", "t700", "t800", "t900"] as const;
const TRACK_HEIGHT = 28;
const THUMB = 26;

/**
 * Profil > Tema rengi. Lavanta Blok'un kalbi: kullanıcı ana rengi (hue) hazır
 * 8 renkten ya da 0–360° serbest çubuktan seçer; tüm uygulama o rengin
 * tonlarıyla anında yeniden boyanır ve seçim cihazda kalır.
 */
export function ThemeColorPicker() {
  const hue = useHueStore((s) => s.hue);
  const setHue = useHueStore((s) => s.setHue);
  const palette = usePalette();

  return (
    <View className="gap-[14px] rounded-card bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text variant="subhead">Ana renk</Text>
        <View className="rounded-[12px] bg-t300 px-[11px] py-[5px]">
          <Text variant="caption">{hueName(hue)}</Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {HUE_PRESETS.map((p) => {
          const selected = p.hue === hue;
          return (
            <Pressable
              key={p.name}
              accessibilityRole="button"
              accessibilityLabel={`${p.name} tema rengi`}
              accessibilityState={{ selected }}
              onPress={() => setHue(p.hue)}
              hitSlop={8}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: swatchColor(p.hue),
                // Seçili: beyaz halka + koyu dış halka (tasarımdaki box-shadow).
                borderWidth: selected ? 3 : 0,
                borderColor: "#FFFFFF",
                shadowColor: rgb(palette.t900),
                shadowOpacity: selected ? 1 : 0,
                shadowRadius: 0,
                shadowOffset: { width: 0, height: 0 },
                outlineStyle: selected ? "solid" : undefined,
                outlineWidth: selected ? 2 : undefined,
                outlineColor: selected ? rgb(palette.t900) : undefined,
              }}
            />
          );
        })}
      </View>

      <HueSlider hue={hue} onChange={setHue} />

      <View className="gap-[6px]">
        <View className="h-[30px] flex-row overflow-hidden rounded-[12px]">
          {TONE_STRIP.map((t) => (
            <View key={t} className="flex-1" style={{ backgroundColor: rgb(palette[t]) }} />
          ))}
        </View>
        <View className="flex-row justify-between">
          <Text variant="caption" muted className="text-[11px]">
            Açık tonlar · zeminler
          </Text>
          <Text variant="caption" muted className="text-[11px]">
            Koyu tonlar · metin
          </Text>
        </View>
      </View>
    </View>
  );
}

/** 0–360° gradyan çubuğu; sürükleyerek ya da dokunarak hue seçilir. */
function HueSlider({ hue, onChange }: { hue: number; onChange: (hue: number) => void }) {
  const [width, setWidth] = useState(0);
  const palette = usePalette();

  const pick = (x: number) => {
    if (width <= 0) return;
    onChange(Math.round(Math.min(1, Math.max(0, x / width)) * 360));
  };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const left = (hue / 360) * width;

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Renk tonu"
      accessibilityValue={{ min: 0, max: 360, now: hue, text: hueName(hue) }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => onChange(Math.min(360, Math.max(0, hue + (e.nativeEvent.actionName === "increment" ? 15 : -15))))}
      onLayout={onLayout}
      style={{ height: TRACK_HEIGHT }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // Dikey kaydırmayı (ScrollView) çubuk üzerindeyken bile elinden alma.
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
      onResponderMove={(e) => pick(e.nativeEvent.locationX)}
    >
      <LinearGradient
        colors={HUE_GRADIENT_STOPS as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2 }}
        pointerEvents="none"
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: (TRACK_HEIGHT - THUMB) / 2,
          left: left - THUMB / 2,
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: rgb(palette.t400),
          borderWidth: 3,
          borderColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      />
    </View>
  );
}
