import { View } from "react-native";

import { isSkiaUsable } from "@/lib/skia-available";

/**
 * Skia statik import edilirse, kütüphanenin web girişi import anında CanvasKit'e
 * dokunup tüm ekranı düşürüyor — runtime kontrolü çalışacak fırsat bulamıyor.
 * Bu yüzden modül yalnızca Skia kullanılabilirken yükleniyor.
 */
const skia = isSkiaUsable()
  ? (require("@shopify/react-native-skia") as typeof import("@shopify/react-native-skia"))
  : null;

interface Props {
  /** 0-1 arası. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}

/**
 * docs/03 → "Skia ile çizilmiş dairesel ilerleme göstergesi".
 *
 * Halka 12 yönünden başlayıp saat yönünde doluyor. İçerik (sayaç metni)
 * children olarak halkanın ortasına yerleşiyor — metni Skia içinde çizmek
 * yerine normal Text kullanmak, sistem yazı tipi ölçeklemesini (Dynamic Type)
 * koruyor.
 */
export function ProgressRing({
  progress,
  size = 260,
  strokeWidth = 14,
  color,
  trackColor,
  children,
}: Props) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const clamped = Math.min(1, Math.max(0, progress));

  // Skia çizemiyorsa halka atlanır ama içerik — yani sayaç metni — görünmeye
  // devam eder. İşlev kaybolmaz, yalnızca süsleme kaybolur.
  if (!skia) {
    return (
      <View
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </View>
    );
  }

  const { Canvas, Circle, Path, RadialGradient, Skia, vec } = skia;
  const path = Skia.Path.Make();
  path.addCircle(center, center, radius);

  // Halkanın arkasında yumuşak bir ambiyans halesi — boşta bile hafifçe
  // görünür (0 ilerlemede bile tamamen sönük durmasın diye), ilerledikçe
  // güçlenir. BreathingOrb'daki halo+RadialGradient tekniğinin aynısı.
  const glowPad = strokeWidth * 2.5;
  const glowSize = size + glowPad * 2;
  const glowCenter = glowSize / 2;
  const haloRadius = radius + strokeWidth * (1.4 + clamped * 0.6);
  const haloOpacity = 0.1 + clamped * 0.22;

  return (
    <View style={{ width: size, height: size }}>
      <View
        pointerEvents="none"
        style={{ position: "absolute", width: glowSize, height: glowSize, left: -glowPad, top: -glowPad }}
      >
        <Canvas style={{ width: glowSize, height: glowSize }}>
          <Circle cx={glowCenter} cy={glowCenter} r={haloRadius} opacity={haloOpacity}>
            <RadialGradient c={vec(glowCenter, glowCenter)} r={haloRadius} colors={[color, "transparent"]} />
          </Circle>
        </Canvas>
      </View>
      <Canvas style={{ width: size, height: size, position: "absolute" }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={strokeWidth}
          color={trackColor}
        />
        <Path
          path={path}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          color={color}
          start={0}
          end={clamped}
          // Skia daireyi 3 yönünden başlatıyor; 12'ye çevirmek için çeyrek tur.
          transform={[{ rotate: -Math.PI / 2 }]}
          origin={{ x: center, y: center }}
        />
      </Canvas>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </View>
  );
}
