import { getApiErrorMessage } from "./apiError";

type ToastHandlers = {
  success: (message: string) => void;
  error: (message: string) => void;
};

/** API yanıtı başarılıysa toast gösterir ve true döner. */
export function notifyApiResponse(
  toast: ToastHandlers,
  res: { success?: boolean; message?: string } | undefined,
  successMessage: string,
): boolean {
  if (res?.success === false) {
    toast.error(res.message?.trim() || "İşlem başarısız oldu.");
    return false;
  }
  const msg = res?.message?.trim();
  toast.success(msg || successMessage);
  return true;
}

/** RTK Query / fetch hatasında toast gösterir. */
export function notifyApiError(
  toast: ToastHandlers,
  err: unknown,
  fallback = "İşlem başarısız oldu.",
): void {
  toast.error(getApiErrorMessage(err, fallback));
}
