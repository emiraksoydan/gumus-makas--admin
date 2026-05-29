import { baseApi, type ApiResult } from "../../store/baseApi";

export type AdminSearchKind =
  | "User"
  | "Store"
  | "FreeBarber"
  | "Service"
  | "ManuelBarber"
  | "Category"
  | "Appointment"
  | "Admin"
  | "Chair"
  | "Complaint"
  | "Request"
  | "ChatThread"
  | "Rating"
  | "Favorite"
  | "Blocked"
  | "SavedFilter";

export interface AdminSearchResult {
  kind: AdminSearchKind;
  entityId: string;
  title: string;
  subtitle?: string | null;
}

export const ADMIN_SEARCH_KIND_ROUTES: Record<AdminSearchKind, string> = {
  User: "/users",
  Store: "/barberstores",
  FreeBarber: "/free-barbers",
  Service: "/service-offerings",
  ManuelBarber: "/manuel-barbers",
  Category: "/categories",
  Appointment: "/appointments",
  Admin: "/admins",
  Chair: "/chairs",
  Complaint: "/complaints",
  Request: "/requests",
  ChatThread: "/chat-threads",
  Rating: "/ratings",
  Favorite: "/favorites",
  Blocked: "/blocked",
  SavedFilter: "/saved-filters",
};

export const ADMIN_SEARCH_KIND_LABELS: Record<AdminSearchKind, string> = {
  User: "Kullanıcı",
  Store: "Salon",
  FreeBarber: "Serbest Berber",
  Service: "Hizmet",
  ManuelBarber: "Manuel Berber",
  Category: "Kategori",
  Appointment: "Randevu",
  Admin: "Admin",
  Chair: "Koltuk",
  Complaint: "Şikayet",
  Request: "Talep",
  ChatThread: "Sohbet",
  Rating: "Değerlendirme",
  Favorite: "Favori",
  Blocked: "Engellenen",
  SavedFilter: "Kayıtlı Filtre",
};

export const adminSearchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchAdmin: build.query<
      AdminSearchResult[],
      { q: string; limit?: number; kind?: AdminSearchKind }
    >({
      query: ({ q, limit = 20, kind }) => ({
        url: "/api/admin/search",
        method: "GET",
        params: { q, limit, ...(kind ? { kind } : {}) },
      }),
      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.kind ?? "all"}|${queryArgs.q.trim().toLowerCase()}|${queryArgs.limit ?? 20}`,
      transformResponse: (res: ApiResult<AdminSearchResult[]>) => res.data ?? [],
    }),
  }),
  overrideExisting: false,
});

export const { useSearchAdminQuery } = adminSearchApi;
