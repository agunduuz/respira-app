import { useReducedMotion } from "react-native-reanimated";

import { motion } from "./tokens";

/**
 * docs/01: sistem "hareketi azalt" ayarı açıkken Skia/Reanimated animasyonları
 * basit fade'e düşmeli. Bu hook süreleri 0'a indirir; çağıran taraf ayrıca
 * `reduced` bayrağına bakıp karmaşık koreografiyi tamamen atlayabilir.
 */
export function useMotion() {
  const reduced = useReducedMotion();

  return {
    reduced,
    duration: reduced
      ? { press: 0, micro: 0, standard: 0, expressive: 0 }
      : motion,
  };
}
