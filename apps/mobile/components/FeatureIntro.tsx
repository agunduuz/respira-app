import type { LucideIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { Button, Screen, Text } from "@/components/ui";
import { cn } from "@/theme/cn";
import { rgb, usePalette } from "@/theme/use-palette";

const BENEFIT_TONES = ["bg-t200", "bg-t100", "bg-t300", "bg-t400"] as const;

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
  const palette = usePalette();

  return (
    <Screen edges={["top"]}>
      <ScrollView contentContainerClassName="flex-grow justify-center gap-8 p-[18px] pb-[130px]">
        <View className="items-center gap-4">
          <View className="items-center justify-center rounded-full bg-t200" style={{ width: 88, height: 88 }}>
            <View className="items-center justify-center rounded-full bg-t900" style={{ width: 56, height: 56 }}>
              <Icon size={26} strokeWidth={2} color={rgb(palette.white)} />
            </View>
          </View>
          <View className="items-center gap-2">
            <Text variant="headline" className="text-center">
              {title}
            </Text>
            <Text variant="body" muted className="text-center">
              {subtitle}
            </Text>
          </View>
        </View>

        <View className="gap-[10px]">
          {benefits.map(({ icon: BenefitIcon, title: benefitTitle, body }, i) => (
            <View
              key={benefitTitle}
              className={cn("flex-row items-center gap-4 rounded-card px-4 py-4", BENEFIT_TONES[i % BENEFIT_TONES.length])}
            >
              <View className="items-center justify-center rounded-full bg-white/60" style={{ width: 44, height: 44 }}>
                <BenefitIcon size={20} strokeWidth={2} color={rgb(palette.t900)} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text variant="subhead">{benefitTitle}</Text>
                <Text variant="bodySm" className="font-bodyMedium">
                  {body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-2">
          <Button title={ctaLabel} icon={ctaIcon} iconColor={rgb(palette.white)} onPress={onPress} />
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
