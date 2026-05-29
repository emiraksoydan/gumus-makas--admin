/**
 * Tüm API istekleri bu tabanı kullanır.
 * - `npm run dev` → `.env.development` (genelde https://localhost:7272)
 * - `npm run build` → `.env.production` (https://api.gumusmakas.com.tr)
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const base = (fromEnv?.trim() || "https://api.gumusmakas.com.tr").replace(/\/$/, "");
  return base;
}
