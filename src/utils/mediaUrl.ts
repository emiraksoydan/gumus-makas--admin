import { getApiBaseUrl } from "../config/api";

/**
 * Profil / upload URL'lerini yerel API ile uyumlu hale getirir.
 * Prod blob URL'leri dev ortamında localhost upload path'ine map edilir.
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  try {
    const apiBase = getApiBaseUrl();
    const parsed = new URL(url, apiBase);
    const uploadsIdx = parsed.pathname.indexOf("/uploads/");
    if (uploadsIdx >= 0) {
      return `${apiBase}${parsed.pathname.slice(uploadsIdx)}${parsed.search}`;
    }
    return url;
  } catch {
    if (url.startsWith("/uploads/")) return `${getApiBaseUrl()}${url}`;
    return url;
  }
}
