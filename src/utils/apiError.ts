import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiResult } from "../store/baseApi";

export function getApiErrorMessage(
  err: unknown,
  fallback = "İşlem başarısız oldu.",
): string {
  if (!err || typeof err !== "object") return fallback;

  const rtkErr = err as FetchBaseQueryError;
  const data = rtkErr.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const body = data as ApiResult & { title?: string; errors?: Record<string, string[]> };
    if (typeof body.message === "string" && body.message.trim()) return body.message;
    if (typeof body.title === "string" && body.title.trim()) return body.title;
    const firstFieldError = body.errors
      ? Object.values(body.errors).flat().find((m) => typeof m === "string" && m.trim())
      : undefined;
    if (firstFieldError) return firstFieldError;
  }

  if ("status" in rtkErr) {
    if (rtkErr.status === 401) return "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";
    if (rtkErr.status === 403) return "Bu işlem için yetkiniz yok.";
    if (rtkErr.status === 405) return "Sunucu bu isteği desteklemiyor. API'yi yeniden başlatın.";
  }

  return fallback;
}
