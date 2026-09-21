import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { Button, Screen, Text } from "@/components/ui";
import { useMotion } from "@/theme/use-motion";
import { FlowProgress } from "./FlowProgress";

interface Props {
  /** 1'den başlayan mevcut adım. */
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  onBack: () => void;
  onNext: () => void;
  /** Varsayılan: ara adımlarda "Devam", son adımda "Kaydet". */
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  error?: string | null;
  /** Butonların altındaki küçük not (uyarı, bilgilendirme). */
  note?: ReactNode;
  children: ReactNode;
}

/**
 * Kurulum akışlarının ortak kabuğu: üstte sabit ilerleme çubuğu, ortada
 * kaydırılabilir adım içeriği, altta sabit Geri/Devam. Beslenme, Duruş ve Su
 * akışları bunu paylaşıyor ki hepsi aynı ritimde ve aynı hızda geçilsin.
 */
export function StepFlow({
  step,
  total,
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  loading,
  error,
  note,
  children,
}: Props) {
  const { duration, reduced } = useMotion();
  const scrollRef = useRef<ScrollView>(null);
  const enter = useSharedValue(0);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    enter.value = 0;
    enter.value = withTiming(1, { duration: duration.standard });
  }, [step, enter, duration.standard]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: reduced ? 0 : (1 - enter.value) * 8 }],
  }));

  // Android geri tuşu ara adımlarda bir önceki adıma döner; akıştan çıkıp
  // girilen her şeyi kaybettirmez.
  useFocusEffect(
    useCallback(() => {
      if (step <= 1) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        onBack();
        return true;
      });
      return () => sub.remove();
    }, [step, onBack])
  );

  return (
    <Screen edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="px-5 pb-1 pt-3">
          <FlowProgress current={step} total={total} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerClassName="p-5 pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[{ gap: 20 }, enterStyle]}>
            <View className="gap-1">
              <Text variant="label" muted>
                ADIM {step} / {total}
              </Text>
              <Text variant="displayLg">{title}</Text>
              {subtitle ? (
                <Text variant="body" muted>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <View className="gap-4">{children}</View>
          </Animated.View>
        </ScrollView>

        <View className="gap-3 border-t border-border px-5 pt-3 pb-4">
          {error ? (
            <Text variant="bodySm" className="text-danger" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          <View className="flex-row gap-2">
            {step > 1 ? (
              <Button title="Geri" variant="secondary" onPress={onBack} className="flex-1" />
            ) : null}
            <Button
              title={nextLabel ?? (step < total ? "Devam" : "Kaydet")}
              onPress={onNext}
              disabled={nextDisabled}
              loading={loading}
              className="flex-1"
            />
          </View>
          {note}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
