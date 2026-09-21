import { View } from "react-native";

import { Text } from "@/components/ui";

/**
 * Form alanı etiketi. Hiyerarşi büyük harfle değil kalınlıkla kurulur
 * (Apple HIG): normal yazım, subhead boyutu, orta kalınlık.
 */
export function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <View className="flex-row items-baseline gap-1.5">
      <Text variant="subhead">{label}</Text>
      {optional ? (
        <Text variant="bodySm" muted>
          opsiyonel
        </Text>
      ) : null}
    </View>
  );
}
