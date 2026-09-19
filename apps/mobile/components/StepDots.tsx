import { View } from "react-native";

interface Props {
  total: number;
  current: number;
  color: string;
  trackColor: string;
}

/** Karşılama akışındaki adım göstergesi — dolu nokta = geçilen/mevcut adım. */
export function StepDots({ total, current, color, trackColor }: Props) {
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current - 1 ? 18 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= current - 1 ? color : trackColor,
          }}
        />
      ))}
    </View>
  );
}
