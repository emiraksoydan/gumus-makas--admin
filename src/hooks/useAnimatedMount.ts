import { useEffect, useRef, useState } from "react";

export type AnimatedMountState = "opening" | "open" | "closing";

/**
 * Bir overlay'in (modal/offcanvas) açılış VE kapanış animasyonlarını yönetir.
 * `isOpen` false olduğunda bileşeni hemen DOM'dan kaldırmaz; önce `closing`
 * durumuna geçirip animasyon süresi kadar bekler, sonra unmount eder.
 *
 * Dönen değerler:
 *  - shouldRender: DOM'da olmalı mı (kapanış animasyonu sürerken hâlâ true)
 *  - state: "opening" | "open" | "closing" — animasyon class'ı seçmek için
 */
export function useAnimatedMount(isOpen: boolean, durationMs = 300) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [state, setState] = useState<AnimatedMountState>(
    isOpen ? "open" : "closing",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isOpen) {
      setShouldRender(true);
      setState("opening");
      // Bir sonraki frame'de "open"a geç ki giriş animasyonu tetiklensin.
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setState("open"));
      });
      return () => cancelAnimationFrame(raf);
    }

    // Kapanış: önce closing'e geç, animasyon bitince unmount.
    setState("closing");
    timerRef.current = setTimeout(() => {
      setShouldRender(false);
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, durationMs]);

  return { shouldRender, state };
}
