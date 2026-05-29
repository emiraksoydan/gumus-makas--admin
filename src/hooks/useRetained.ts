import { useRef } from "react";

/**
 * Son null/undefined olmayan değeri saklar.
 *
 * Detay offcanvas'larında parent kapanırken seçili kaydı (ör. `setSelected(null)`)
 * anında null yapıyor. Eğer wrapper `if (!entity) return null` derse offcanvas
 * kapanış animasyonu oynamadan DOM'dan kalkar. Bu hook sayesinde kapanış
 * animasyonu süresince son veri ekranda kalmaya devam eder.
 */
export function useRetained<T>(value: T | null | undefined): T | null {
  const ref = useRef<T | null>(null);
  if (value != null) ref.current = value;
  return value ?? ref.current;
}
