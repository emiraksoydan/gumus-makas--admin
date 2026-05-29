import { baseApi, type ApiResult } from "../../store/baseApi";

// Backend Entities.Concrete.Enums.AuditAction
export enum AuditAction {
  AccountClosed = 1,
  ChatMessageSentAppointmentThread = 2,
  ChatMessageSentFavoriteThread = 3,
  ChatMediaMessageSent = 4,
  ChatMessageHiddenForUser = 5,
  ChatThreadHiddenForUser = 6,
  AuthOtpVerificationFailed = 7,
  AuthLoginSuccess = 8,
  AuthRegisterSuccess = 9,
  AuthRefreshSuccess = 10,
  AuthLogout = 11,
  AppointmentCreated = 12,
  AppointmentStoreLinkedToExisting = 13,
  AppointmentApprovedByStore = 14,
  AppointmentRejectedByStore = 15,
  AppointmentApprovedByFreeBarber = 16,
  AppointmentRejectedByFreeBarber = 17,
  AppointmentApprovedByCustomer = 18,
  AppointmentRejectedByCustomer = 19,
  AppointmentCancelled = 20,
  AppointmentCompleted = 21,
  AppointmentHiddenByUser = 22,
  AppointmentHiddenByUserBulk = 23,
  BarberStoreDeleted = 24,
  FreeBarberPanelDeleted = 25,
  ComplaintCreated = 26,
  RatingDeleted = 27,
  ManuelBarberDeleted = 28,
  RatingCreated = 29,
  FavoriteAdded = 30,
  FavoriteRemoved = 31,
  UserBlocked = 32,
  UserUnblocked = 33,
  RequestCreated = 34,
  RequestDeleted = 35,
  SavedFilterCreated = 36,
  SavedFilterUpdated = 37,
  SavedFilterDeleted = 38,
  BarberStoreCreated = 39,
  BarberStoreUpdated = 40,
  FreeBarberPanelCreated = 41,
  FreeBarberPanelUpdated = 42,
  ManuelBarberCreated = 43,
  ComplaintDeleted = 44,
  ManuelBarberUpdated = 45,
  AdminUserBanned = 100,
  AdminUserUnbanned = 101,
  AdminSubscriptionUpdated = 102,
  AdminCreated = 103,
  AdminDeleted = 104,
  AdminActivated = 105,
  AdminDeactivated = 106,
  AdminChatThreadViewed = 107,
  AdminAuditLogViewed = 108,
  AdminProfileUpdated = 109,
  AdminPasswordChanged = 110,
  AdminCategoryCreated = 111,
  AdminCategoryUpdated = 112,
  AdminCategoryDeleted = 113,
  AdminHelpGuideCreated = 114,
  AdminHelpGuideUpdated = 115,
  AdminHelpGuideDeleted = 116,
  AdminHelpGuideActiveChanged = 117,
  AdminComplaintResolved = 118,
  AdminRequestProcessed = 119,
  AdminAppointmentCancelled = 120,
  AdminBarberStoreSuspended = 121,
  AdminBarberStoreUnsuspended = 122,
  AdminFreeBarberSuspended = 123,
  AdminFreeBarberUnsuspended = 124,
  AdminRatingDeleted = 125,
  AdminAiChatCompleted = 126,
}

export const auditActionLabels: Partial<Record<AuditAction, string>> = {
  [AuditAction.AccountClosed]: "Hesap kapatıldı",
  [AuditAction.ChatMessageSentAppointmentThread]: "Randevu sohbetinde mesaj gönderildi",
  [AuditAction.ChatMessageSentFavoriteThread]: "Favori sohbetinde mesaj gönderildi",
  [AuditAction.ChatMediaMessageSent]: "Sohbette medya mesajı gönderildi",
  [AuditAction.ChatMessageHiddenForUser]: "Sohbette mesaj kullanıcıya gizlendi",
  [AuditAction.ChatThreadHiddenForUser]: "Sohbet kullanıcıya gizlendi",
  [AuditAction.AuthOtpVerificationFailed]: "OTP doğrulaması başarısız",
  [AuditAction.AuthLoginSuccess]: "Giriş başarılı",
  [AuditAction.AuthRegisterSuccess]: "Kayıt başarılı",
  [AuditAction.AuthRefreshSuccess]: "Token yenilendi",
  [AuditAction.AuthLogout]: "Çıkış yapıldı",
  [AuditAction.AppointmentCreated]: "Randevu oluşturuldu",
  [AuditAction.AppointmentStoreLinkedToExisting]: "Randevuya işletme bağlandı",
  [AuditAction.AppointmentApprovedByStore]: "Randevu işletmece onaylandı",
  [AuditAction.AppointmentRejectedByStore]: "Randevu işletmece reddedildi",
  [AuditAction.AppointmentApprovedByFreeBarber]: "Randevu berberce onaylandı",
  [AuditAction.AppointmentRejectedByFreeBarber]: "Randevu berberce reddedildi",
  [AuditAction.AppointmentApprovedByCustomer]: "Randevu müşterice onaylandı",
  [AuditAction.AppointmentRejectedByCustomer]: "Randevu müşterice reddedildi",
  [AuditAction.AppointmentCancelled]: "Randevu iptal edildi",
  [AuditAction.AppointmentCompleted]: "Randevu tamamlandı",
  [AuditAction.AppointmentHiddenByUser]: "Randevu kullanıcı tarafından gizlendi",
  [AuditAction.AppointmentHiddenByUserBulk]: "Randevular toplu gizlendi",
  [AuditAction.BarberStoreDeleted]: "İşletme silindi",
  [AuditAction.FreeBarberPanelDeleted]: "Bağımsız berber paneli silindi",
  [AuditAction.ComplaintCreated]: "Şikayet oluşturuldu",
  [AuditAction.RatingDeleted]: "Değerlendirme silindi",
  [AuditAction.ManuelBarberDeleted]: "Manuel berber silindi",
  [AuditAction.RatingCreated]: "Değerlendirme oluşturuldu",
  [AuditAction.FavoriteAdded]: "Favoriye eklendi",
  [AuditAction.FavoriteRemoved]: "Favoriden çıkarıldı",
  [AuditAction.UserBlocked]: "Kullanıcı engellendi",
  [AuditAction.UserUnblocked]: "Kullanıcı engeli kaldırıldı",
  [AuditAction.RequestCreated]: "Talep oluşturuldu",
  [AuditAction.RequestDeleted]: "Talep silindi",
  [AuditAction.SavedFilterCreated]: "Kayıtlı filtre oluşturuldu",
  [AuditAction.SavedFilterUpdated]: "Kayıtlı filtre güncellendi",
  [AuditAction.SavedFilterDeleted]: "Kayıtlı filtre silindi",
  [AuditAction.BarberStoreCreated]: "Berber salonu oluşturuldu",
  [AuditAction.BarberStoreUpdated]: "Berber salonu güncellendi",
  [AuditAction.FreeBarberPanelCreated]: "Serbest berber paneli oluşturuldu",
  [AuditAction.FreeBarberPanelUpdated]: "Serbest berber paneli güncellendi",
  [AuditAction.ManuelBarberCreated]: "Manuel berber eklendi",
  [AuditAction.ComplaintDeleted]: "Şikayet silindi",
  [AuditAction.ManuelBarberUpdated]: "Manuel berber güncellendi",
  [AuditAction.AdminUserBanned]: "Admin: kullanıcıyı engelledi",
  [AuditAction.AdminUserUnbanned]: "Admin: engeli kaldırdı",
  [AuditAction.AdminSubscriptionUpdated]: "Admin: abonelik güncelledi",
  [AuditAction.AdminCreated]: "Admin: yeni admin oluşturdu",
  [AuditAction.AdminDeleted]: "Admin: admin sildi",
  [AuditAction.AdminActivated]: "Admin: admini aktive etti",
  [AuditAction.AdminDeactivated]: "Admin: admini pasifleştirdi",
  [AuditAction.AdminChatThreadViewed]: "Admin: sohbet detayını görüntüledi",
  [AuditAction.AdminAuditLogViewed]: "Admin: denetim listesini görüntüledi",
  [AuditAction.AdminProfileUpdated]: "Admin: profil güncelledi",
  [AuditAction.AdminPasswordChanged]: "Admin: şifre değiştirdi",
  [AuditAction.AdminCategoryCreated]: "Admin: kategori oluşturdu",
  [AuditAction.AdminCategoryUpdated]: "Admin: kategori güncelledi",
  [AuditAction.AdminCategoryDeleted]: "Admin: kategori sildi",
  [AuditAction.AdminHelpGuideCreated]: "Admin: yardım rehberi oluşturdu",
  [AuditAction.AdminHelpGuideUpdated]: "Admin: yardım rehberi güncelledi",
  [AuditAction.AdminHelpGuideDeleted]: "Admin: yardım rehberi sildi",
  [AuditAction.AdminHelpGuideActiveChanged]: "Admin: yardım rehberi durumu değiştirdi",
  [AuditAction.AdminComplaintResolved]: "Admin: şikayeti çözümledi",
  [AuditAction.AdminRequestProcessed]: "Admin: talebi işledi",
  [AuditAction.AdminAppointmentCancelled]: "Admin: randevuyu iptal etti",
  [AuditAction.AdminBarberStoreSuspended]: "Admin: salonu askıya aldı",
  [AuditAction.AdminBarberStoreUnsuspended]: "Admin: salon askısını kaldırdı",
  [AuditAction.AdminFreeBarberSuspended]: "Admin: serbest berberi askıya aldı",
  [AuditAction.AdminFreeBarberUnsuspended]: "Admin: serbest berber askısını kaldırdı",
  [AuditAction.AdminRatingDeleted]: "Admin: değerlendirmeyi sildi",
  [AuditAction.AdminAiChatCompleted]: "Admin: yapay zeka asistanı kullandı",
};

/** actionName (PascalCase enum) → Türkçe; bilinmeyen aksiyonlar için yedek */
const auditActionNameLabels: Record<string, string> = Object.fromEntries(
  Object.entries(AuditAction)
    .filter(([k]) => Number.isNaN(Number(k)))
    .map(([k, v]) => [k, auditActionLabels[v as AuditAction] ?? k]),
);

export function getAuditActionLabel(
  action: AuditAction | number,
  actionName?: string | null,
): string {
  const byValue = auditActionLabels[action as AuditAction];
  if (byValue) return byValue;
  if (actionName && auditActionNameLabels[actionName]) {
    return auditActionNameLabels[actionName];
  }
  return actionName ?? `Bilinmeyen aksiyon (${action})`;
}

export interface AuditLogItem {
  id: string;
  occurredAt: string;
  actorUserId?: string | null;
  actorDisplayName?: string | null;
  action: AuditAction;
  actionName: string;
  resourceId?: string | null;
  relatedResourceId?: string | null;
  success: boolean;
  failureReason?: string | null;
  clientIp?: string | null;
}

export interface AuditLogPaged {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type AuditLogScope = "mobile" | "admin";

export const ADMIN_AUDIT_ACTION_MIN = AuditAction.AdminUserBanned;

export interface AuditLogQuery {
  action?: AuditAction;
  actorUserId?: string;
  resourceId?: string;
  fromUtc?: string;
  toUtc?: string;
  success?: boolean;
  scope?: AuditLogScope;
  page?: number;
  pageSize?: number;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<AuditLogPaged, AuditLogQuery | void>({
      query: (filter) => {
        const params = new URLSearchParams();
        const f = filter ?? {};
        if (f.action !== undefined) params.set("action", String(f.action));
        if (f.actorUserId) params.set("actorUserId", f.actorUserId);
        if (f.resourceId) params.set("resourceId", f.resourceId);
        if (f.fromUtc) params.set("fromUtc", f.fromUtc);
        if (f.toUtc) params.set("toUtc", f.toUtc);
        if (f.success !== undefined) params.set("success", String(f.success));
        if (f.scope) params.set("scope", f.scope);
        params.set("page", String(f.page ?? 1));
        params.set("pageSize", String(f.pageSize ?? 50));
        return { url: `/api/admin/audit-logs?${params.toString()}`, method: "GET" };
      },
      transformResponse: (res: ApiResult<AuditLogPaged>) => res.data ?? {
        items: [],
        total: 0,
        page: 1,
        pageSize: 50,
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery } = auditApi;
