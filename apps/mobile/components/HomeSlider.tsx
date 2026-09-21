import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Droplet, Eye, PersonStanding, Wind, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";

import { Text } from "@/components/ui";
import { useAccentFor, type Feature } from "@/theme/feature-theme";
import { useMotion } from "@/theme/use-motion";

const GAP = 12;
const SIDE = 20;
const HEIGHT = 172;
const AUTO_ADVANCE_MS = 6000;

interface SlideData {
  id: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  feature: Feature;
  href: "/eye" | "/water" | "/posture" | "/stress";
}

const SLIDES: readonly SlideData[] = [
  {
    id: "eye",
    icon: Eye,
    kicker: "Göz molası",
    title: "20 dakikada bir, 20 saniye",
    body: "Sayacı başlat, molayı sana hatırlatalım.",
    feature: "goz",
    href: "/eye",
  },
  {
    id: "water",
    icon: Droplet,
    kicker: "Su",
    title: "Gün içine yay",
    body: "Hedefini küçük yudumlarla tamamla.",
    feature: "su",
    href: "/water",
  },
  {
    id: "posture",
    icon: PersonStanding,
    kicker: "Duruş",
    title: "Saat başı kısa bir set",
    body: "Ekipman gerekmez, birkaç dakika yeter.",
    feature: "durus",
    href: "/posture",
  },
  {
    id: "stress",
    icon: Wind,
    kicker: "Nefes",
    title: "Birkaç dakikalık mola",
    body: "Sana uygun tekniği birlikte seçelim.",
    feature: "nefes",
    href: "/stress",
  },
];

/**
 * Anasayfanın üstündeki kaydırmalı şerit. Her slayt bir modülü temsil ediyor ve
 * dokununca o modülün ekranını açıyor. Görsel dil paletten türetilmiş gradyan +
 * ikon — fotoğraf kullanmıyoruz (docs/01: jenerik "sağlık" görselinden kaçın).
 */
export function HomeSlider() {
  const { reduced } = useMotion();
  const { width } = useWindowDimensions();
  const slideWidth = Math.max(240, width - SIDE * 2);
  const interval = slideWidth + GAP;

  const scrollRef = useRef<ScrollView>(null);
  const interacted = useRef(false);
  const [index, setIndex] = useState(0);

  // Kullanıcı şeride dokunana kadar yavaşça ilerler; "hareketi azalt" açıkken hiç ilerlemez.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      if (interacted.current) return;
      setIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * interval, animated: true });
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [interval, reduced]);

  return (
    <View className="gap-3">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: SIDE, gap: GAP }}
        onScrollBeginDrag={() => {
          interacted.current = true;
        }}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / interval))}
      >
        {SLIDES.map((slide) => (
          <Slide key={slide.id} slide={slide} width={slideWidth} />
        ))}
      </ScrollView>

      <View className="flex-row justify-center gap-1.5" accessibilityElementsHidden>
        {SLIDES.map((s, i) => (
          <View
            key={s.id}
            className={i === index ? "bg-accent" : "bg-border-strong"}
            style={{ width: i === index ? 16 : 6, height: 6, borderRadius: 3 }}
          />
        ))}
      </View>
    </View>
  );
}

const rgba = (channels: string, alpha: number) => `rgba(${channels.split(" ").join(", ")}, ${alpha})`;

/** Tek slayt — rengini temsil ettiği modülün aksanından alır (UI-004). */
function Slide({ slide, width }: { slide: SlideData; width: number }) {
  const { icon: Icon, kicker, title, body, feature, href } = slide;
  const { accent, onAccent } = useAccentFor(feature);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${kicker}: ${title}`}
      onPress={() => router.push(href)}
      style={{ width, height: HEIGHT }}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={[rgba(accent, 1), rgba(accent, 0.72)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 16,
            padding: 20,
            justifyContent: "space-between",
            opacity: pressed ? 0.85 : 1,
          }}
        >
          <Icon size={26} strokeWidth={1.75} color={rgba(onAccent, 0.9)} />
          <View className="gap-1">
            <Text variant="label" style={{ color: rgba(onAccent, 0.75) }}>
              {kicker.toLocaleUpperCase("tr-TR")}
            </Text>
            <Text variant="title" style={{ color: rgba(onAccent, 1) }}>
              {title}
            </Text>
            <Text variant="bodySm" style={{ color: rgba(onAccent, 0.85) }}>
              {body}
            </Text>
          </View>
        </LinearGradient>
      )}
    </Pressable>
  );
}
