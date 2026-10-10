import { Children, Fragment, type ReactNode } from "react";
import { View } from "react-native";

import { Card, Text } from "@/components/ui";

/**
 * Ayarlar ekranındaki gruplu liste (Apple Ayarlar kalıbı): küçük bir başlık,
 * ince çizgilerle ayrılmış satırlar tek kartta, altında isteğe bağlı açıklama.
 */
export function SettingsGroup({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const rows = Children.toArray(children);

  return (
    <View className="gap-2">
      {title ? (
        <Text variant="subhead" muted className="px-1">
          {title}
        </Text>
      ) : null}
      <Card className="gap-0 p-0">
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View className="h-[1.5px] bg-line" style={{ marginLeft: 20 }} /> : null}
            {row}
          </Fragment>
        ))}
      </Card>
      {footer ? (
        typeof footer === "string" ? (
          <Text variant="bodySm" muted className="px-1">
            {footer}
          </Text>
        ) : (
          footer
        )
      ) : null}
    </View>
  );
}
