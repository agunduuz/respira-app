import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { isSkiaUsable } from "@/lib/skia-available";
import { useMotion } from "@/theme/use-motion";

// Statik import, Skia'sız platformlarda ekranı düşürüyor — bkz. ProgressRing.
const skia = isSkiaUsable()
  ? (require("@shopify/react-native-skia") as typeof import("@shopify/react-native-skia"))
  : null;

const WIDTH = 190;
const HEIGHT = 236;
/** Klasik tumbler silüeti: taban tepeden dar — düz bir kutudan çok daha gerçekçi. */
const TOP_WIDTH = 166;
const BOTTOM_WIDTH = 132;
const CORNER_R = 22;
/** "Tam dolu" bile kenara dayanmaz — gerçek bir bardakta üstte hep biraz boşluk kalır. */
const RIM_GAP = 16;
const FILL_TOP = RIM_GAP;

interface Props {
  /** 0-1 arası — günlük hedefe göre doluluk oranı. */
  ratio: number;
  accent: string;
  surface: string;
  trackColor: string;
}

/**
 * docs/06 → "doldurulan bir su bardağı/şişe animasyonu": konteyner + dalga
 * efekti, içilen miktar arttıkça yükselen sıvı seviyesi.
 *
 * Skia kullanılamayan platformlarda (bkz. skia-available.ts) işlev kaybolmaz,
 * yalnızca dalga süsü kaybolur: düz bir dolgu barı aynı oranı gösterir.
 *
 * `skia` modül yüklemesinde bir kez sabitlenip bir daha değişmiyor, bu yüzden
 * iki ayrı bileşene bölmek güvenli: her biri kendi hook'larını KOŞULSUZ
 * çağırıyor, Skia null olma ihtimaliyle tip/hook sırası çelişkisi oluşmuyor.
 */
export function WaterWave(props: Props) {
  return skia ? <SkiaWave {...props} /> : <FallbackWave {...props} />;
}

function FallbackWave({ ratio, accent, trackColor }: Props) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const level = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(clamped, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [clamped, level]);

  const fallbackStyle = useAnimatedStyle(() => ({
    height: `${level.value * 100}%`,
  }));

  return (
    <View
      style={{
        width: WIDTH,
        height: HEIGHT,
        borderRadius: CORNER_R,
        borderWidth: 2,
        borderColor: trackColor,
        overflow: "hidden",
        justifyContent: "flex-end",
      }}
    >
      <Animated.View style={[{ backgroundColor: accent, width: "100%" }, fallbackStyle]} />
    </View>
  );
}

/** "rgb(r, g, b)" (veya hex) metnini kanallara çözer; tanınmayan girdide aksan mintine düşer. */
function parseChannels(input: string): [number, number, number] {
  const rgbMatch = input.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgbMatch) return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];

  const hex = input.replace("#", "");
  if (hex.length === 6) {
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  return [124, 224, 184];
}

/** `weight`=1 tamamen `toward`. Beyaza karıştırınca canlı bir üst ton, siyaha karıştırınca derin bir alt ton çıkar. */
function mixColor(base: string, toward: "white" | "black", weight: number): string {
  const [r, g, b] = parseChannels(base);
  const target = toward === "white" ? 255 : 0;
  const mix = (c: number) => Math.round(c + (target - c) * weight);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/**
 * Köşeleri yuvarlatılmış bir çokgen — HTML Canvas'ın arcTo'suyla aynı mantık
 * (arcToTangent). Her köşeyi tek tek bezier'e çevirmek yerine tek genel amaçlı
 * yardımcı: dörtgenden fazlasına da (kapaklı şişe vb.) genişleyebilir.
 */
function roundedPolygonPath(Skia: (typeof import("@shopify/react-native-skia"))["Skia"], points: { x: number; y: number }[], radius: number) {
  const path = Skia.Path.Make();
  const n = points.length;

  const first = points[0]!;
  const second = points[1]!;
  const edgeLen = Math.hypot(second.x - first.x, second.y - first.y);
  const t = Math.min(radius / edgeLen, 0.5);
  const start = { x: first.x + (second.x - first.x) * t, y: first.y + (second.y - first.y) * t };

  path.moveTo(start.x, start.y);
  for (let i = 1; i <= n; i++) {
    const corner = points[i % n]!;
    const next = points[(i + 1) % n]!;
    path.arcToTangent(corner.x, corner.y, next.x, next.y, radius);
  }
  path.close();
  return path;
}

function SkiaWave({ ratio, accent, trackColor }: Props) {
  const { Canvas, Circle, Group, Path, RoundedRect, LinearGradient, Skia, vec } = skia!;

  const { reduced } = useMotion();
  const clamped = Math.min(1, Math.max(0, ratio));

  const centerX = WIDTH / 2;
  const tumblerPath = useMemo(
    () =>
      roundedPolygonPath(
        Skia,
        [
          { x: centerX - TOP_WIDTH / 2, y: 0 },
          { x: centerX + TOP_WIDTH / 2, y: 0 },
          { x: centerX + BOTTOM_WIDTH / 2, y: HEIGHT },
          { x: centerX - BOTTOM_WIDTH / 2, y: HEIGHT },
        ],
        CORNER_R
      ),
    [Skia, centerX]
  );

  const level = useSharedValue(0);
  const phase = useSharedValue(0);
  const bubbleA = useSharedValue(0);
  const bubbleB = useSharedValue(0);
  const bubbleC = useSharedValue(0);

  useEffect(() => {
    level.value = withTiming(clamped, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [clamped, level]);

  useEffect(() => {
    if (reduced) {
      phase.value = 0;
      bubbleA.value = 0;
      bubbleB.value = 0;
      bubbleC.value = 0;
      return;
    }
    phase.value = withRepeat(withTiming(1, { duration: 3400, easing: Easing.linear }), -1, false);
    bubbleA.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1, false);
    bubbleB.value = withDelay(
      900,
      withRepeat(withTiming(1, { duration: 3800, easing: Easing.linear }), -1, false)
    );
    bubbleC.value = withDelay(
      1800,
      withRepeat(withTiming(1, { duration: 2900, easing: Easing.linear }), -1, false)
    );
  }, [reduced, phase, bubbleA, bubbleB, bubbleC]);

  const fillHeight = HEIGHT - FILL_TOP;
  const waterY = useDerivedValue(() => HEIGHT - fillHeight * level.value);

  // Arka dalga: daha yavaş, daha küçük genlik, koyu tonda — ön dalganın
  // arkasında bir derinlik hissi verir. Aynı tek zamanlayıcıdan (phase)
  // beslenir, ikinci bir interval açmaya gerek kalmaz.
  const backWavePath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const amplitude = reduced ? 0 : 4;
    const waveLength = WIDTH / 1.1;
    const shift = phase.value * Math.PI * 2 * 0.7 + Math.PI;

    path.moveTo(0, waterY.value);
    for (let x = 0; x <= WIDTH; x += 8) {
      const y = waterY.value + Math.sin((x / waveLength) * Math.PI * 2 + shift) * amplitude - 3;
      path.lineTo(x, y);
    }
    path.lineTo(WIDTH, HEIGHT);
    path.lineTo(0, HEIGHT);
    path.close();
    return path;
  });

  const frontWavePath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const amplitude = reduced ? 0 : 6;
    const waveLength = WIDTH / 1.4;
    const shift = phase.value * Math.PI * 2;

    path.moveTo(0, waterY.value);
    for (let x = 0; x <= WIDTH; x += 6) {
      const y = waterY.value + Math.sin((x / waveLength) * Math.PI * 2 + shift) * amplitude;
      path.lineTo(x, y);
    }
    path.lineTo(WIDTH, HEIGHT);
    path.lineTo(0, HEIGHT);
    path.close();
    return path;
  });

  // Yüzeyde ince, parlak bir çizgi — ışığın suya vurduğu izlenimi verir.
  const surfaceSheenPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const amplitude = reduced ? 0 : 6;
    const waveLength = WIDTH / 1.4;
    const shift = phase.value * Math.PI * 2;

    path.moveTo(0, waterY.value);
    for (let x = 0; x <= WIDTH; x += 6) {
      const y = waterY.value + Math.sin((x / waveLength) * Math.PI * 2 + shift) * amplitude;
      path.lineTo(x, y);
    }
    for (let x = WIDTH; x >= 0; x -= 6) {
      const y = waterY.value + Math.sin((x / waveLength) * Math.PI * 2 + shift) * amplitude - 3;
      path.lineTo(x, y);
    }
    path.close();
    return path;
  });

  const backTint = mixColor(accent, "black", 0.22);
  const topTint = mixColor(accent, "white", 0.12);
  const deepTint = mixColor(accent, "black", 0.35);
  const sheenTint = mixColor(accent, "white", 0.65);

  const bubble1 = useBubbleDerived(bubbleA, waterY, 0.32, 3.2);
  const bubble2 = useBubbleDerived(bubbleB, waterY, 0.58, 2.4);
  const bubble3 = useBubbleDerived(bubbleC, waterY, 0.46, 4);

  return (
    <Canvas style={{ width: WIDTH, height: HEIGHT }}>
      <Group clip={tumblerPath}>
        <Path path={backWavePath} color={backTint} opacity={0.55} />
        <Path path={frontWavePath}>
          <LinearGradient start={vec(0, 0)} end={vec(0, HEIGHT)} colors={[topTint, deepTint]} />
        </Path>
        <Path path={surfaceSheenPath} color={sheenTint} opacity={0.45} />

        <Circle cx={bubble1.x} cy={bubble1.y} r={bubble1.r} color={sheenTint} opacity={bubble1.opacity} />
        <Circle cx={bubble2.x} cy={bubble2.y} r={bubble2.r} color={sheenTint} opacity={bubble2.opacity} />
        <Circle cx={bubble3.x} cy={bubble3.y} r={bubble3.r} color={sheenTint} opacity={bubble3.opacity} />

        {/* Cam parlaklığı: sol üstten geçen soluk, çapraz bir ışık şeridi. */}
        <Group transform={[{ rotate: -0.32 }]} origin={vec(centerX - TOP_WIDTH / 4, HEIGHT / 2)}>
          <RoundedRect
            x={centerX - TOP_WIDTH / 4 - 11}
            y={-20}
            width={22}
            height={HEIGHT + 40}
            r={11}
            color="white"
            opacity={0.1}
          />
        </Group>
      </Group>

      <Path path={tumblerPath} style="stroke" strokeWidth={2.5} color={trackColor} />
    </Canvas>
  );
}

/**
 * Tek bir kabarcığın dikey seyahatini ve görünürlüğünü türetir: su yüzeyinin
 * hemen altından tabana kadar döngüsel olarak yükselir, iki ucunda solar; su
 * neredeyse boşken (level≈0) tamamen görünmez olur.
 */
function useBubbleDerived(
  progress: SharedValue<number>,
  waterY: SharedValue<number>,
  xFrac: number,
  radius: number
) {
  const cx = useDerivedValue(() => WIDTH / 2 - BOTTOM_WIDTH / 2 + BOTTOM_WIDTH * xFrac);
  const cy = useDerivedValue(() => {
    const bottomY = HEIGHT - 16;
    const topY = Math.min(bottomY - 12, waterY.value + 12);
    return bottomY - (bottomY - topY) * progress.value;
  });
  const opacity = useDerivedValue(() => {
    const fillAmount = Math.max(0, Math.min(1, (HEIGHT - waterY.value) / (HEIGHT - FILL_TOP)));
    const fade = Math.sin(Math.min(1, Math.max(0, progress.value)) * Math.PI);
    return fade * 0.4 * Math.min(1, fillAmount * 3);
  });
  const r = useDerivedValue(() => radius);
  return { x: cx, y: cy, r, opacity };
}
