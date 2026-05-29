import { baseApi, type ApiResult } from "../../store/baseApi";

export interface AdminAIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AdminAIActionResult {
  tool: string;
  success: boolean;
  summary: string;
}

export interface AdminAIPendingAction {
  id: string;
  tool: string;
  summary: string;
  inputJson: string;
}

export interface AdminAIChatResponse {
  reply: string;
  providerUsed?: string | null;
  actionsExecuted: AdminAIActionResult[];
  requiresConfirmation: boolean;
  pendingActions: AdminAIPendingAction[];
}

export interface AdminAIChatRequest {
  message: string;
  history?: AdminAIChatMessage[];
}

export const ADMIN_AI_TOOL_LABELS: Record<string, string> = {
  ban_user: "Kullanıcı engelle",
  unban_user: "Engeli kaldır",
  set_subscription: "Abonelik güncelle",
  suspend_barber_store: "Dükkan askısı",
  suspend_free_barber: "Serbest berber askısı",
  resolve_complaint: "Şikayet çöz",
  mark_request_processed: "Talep işaretle",
  cancel_appointment: "Randevu iptal",
  delete_rating: "Puan sil",
};

export const adminAiApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminAiChat: build.mutation<ApiResult<AdminAIChatResponse>, AdminAIChatRequest>({
      query: (body) => ({
        url: "/api/admin/ai/chat",
        method: "POST",
        body,
      }),
    }),
    adminAiConfirm: build.mutation<
      ApiResult<AdminAIChatResponse>,
      { actions: AdminAIPendingAction[] }
    >({
      query: (body) => ({
        url: "/api/admin/ai/confirm",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useAdminAiChatMutation, useAdminAiConfirmMutation } = adminAiApi;

export const ADMIN_AI_ERROR_MESSAGES: Record<string, string> = {
  admin_ai_error: "Yapay zeka asistanı yanıt veremedi.",
  admin_ai_rate_limit: "İstek limiti aşıldı. Lütfen biraz bekleyin.",
  "Admin yapay zeka asistanı yapılandırılmamış (Anthropic API anahtarı gerekli).":
    "Asistan yapılandırılmamış (Anthropic API anahtarı gerekli).",
  whisper_failed: "Ses metne çevrilemedi.",
  whisper_rate_limit: "Ses servisi yoğun. Biraz bekleyin.",
  whisper_unavailable: "Ses servisi kullanılamıyor.",
  transcription_empty: "Konuşma algılanamadı.",
  "Mesaj boş olamaz.": "Mesaj boş olamaz.",
};

export function resolveAdminAiError(message?: string): string {
  if (!message) return "Beklenmeyen bir hata oluştu.";
  return ADMIN_AI_ERROR_MESSAGES[message] ?? message;
}
