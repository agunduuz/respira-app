import type { LucideIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { useThemeStore } from "@/theme/theme-store";
import { darkPalette, lightPalette } from "@/theme/tokens";

const rgb = (c: string) => `rgb(${c.split(" ").join(", ")})`;

export interface FeatureIntroBenefit {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  benefits: readonly FeatureIntroBenefit[];
  ctaLabel: string;
  ctaIcon?: LucideIcon;
  onPress: () => void;
  caption?: string;
}

/**
 * Bir özelliğin "henüz kurulmadı" ilk karşılama ekranı — ikon rozeti, kısa
 * değer önermesi, fayda listesi ve tek bir CTA. Beslenme/Su/Duruş'un profil
 * kurulmadan önceki ekranları aynı bileşeni paylaşıyor ki üçü de aynı
 * kalitede kalsın ve tek yerden bakımı yapılabilsin.
 */
export function FeatureIntro({ icon: Icon, title, subtitle, benefits, ctaLabel, ctaIcon, onPress, caption }: Props) {
  const preference = useThemeStore((s) => s.preference);
  const palette = preference === "light" ? lightPalette : darkPalette;

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="flex-1 justify-center gap-8 p-6">
        <View className="items-center gap-3">
          <View className="items-center justify-center" style={{ width: 72, height: 72 }}>
            <View
              className="bg-accent"
              style={{ position: "absolute", width: 72, height: 72, borderRadius: 36, opacity: 0.12 }}
            />
            <View
              className="items-center justify-center rounded-full bg-elevated"
              style={{ width: 52, height: 52 }}
            >
              <Icon size={24} strokeWidth={1.75} color={rgb(palette.accent)} />
            </View>
          </View>
          <View className="items-center gap-1">
            <Text variant="displayLg" className="text-center">
              {title}
            </Text>
            <Text variant="body" muted className="text-center">
              {subtitle}
            </Text>
          </View>
        </View>

        <Card className="gap-0 p-0">
          {benefits.map(({ icon: BenefitIcon, title: benefitTitle, body }, i) => (
            <View
              key={benefitTitle}
              className={cn("flex-row items-center gap-4 px-4 py-3.5", i > 0 && "border-t border-border")}
            >
              <View
                className="items-center justify-center rounded-full bg-elevated"
                style={{ width: 36, height: 36 }}
              >
                <BenefitIcon size={18} strokeWidth={1.75} color={rgb(palette.accent)} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="label">{benefitTitle}</Text>
                <Text variant="bodySm" muted>
                  {body}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <View className="gap-2">
          <Button title={ctaLabel} icon={ctaIcon} iconColor={rgb(palette.onAccent)} onPress={onPress} />
          {caption ? (
            <Text variant="bodySm" muted className="text-center">
              {caption}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
