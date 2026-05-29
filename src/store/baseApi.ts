import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  logout,
  tokenRefreshed,
  readStoredRefreshToken,
} from "../features/auth/authSlice";
import type { RootState } from "./store";
import { getApiBaseUrl } from "../config/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Refresh akışı: bir 401 yakaladığımızda mevcut refresh token ile yeni access
// almayı dener; başarısızsa logout. Eşzamanlı 401'lerin aynı anda refresh'i
// patlatmaması için promise paylaşımı yapıyoruz.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Önce localStorage'daki en güncel token'ı dene: başka bir sekme
      // refresh yapıp token'ı rotate etmiş olabilir; Redux state'i bayat
      // kalabilir. Bayat token kullanmak gereksiz logout'a yol açar.
      const state = api.getState() as RootState;
      const refreshToken =
        readStoredRefreshToken() ?? state.auth.refreshToken;
      if (!refreshToken) return false;

      const result = await rawBaseQuery(
        {
          url: "/api/auth/admin/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      // ApiResult: { success, message, data: AccessToken }
      const data = (result.data as ApiResult<AccessTokenResponse> | undefined)
        ?.data;

      if (!data?.token || !data?.refreshToken) return false;

      api.dispatch(
        tokenRefreshed({
          token: data.token,
          tokenExpiration: data.expiration,
          refreshToken: data.refreshToken,
          refreshTokenExpires: data.refreshTokenExpires,
          admin:
            data.adminId || data.adminEmail
              ? {
                  id: data.adminId,
                  email: data.adminEmail,
                  fullName: data.adminFullName,
                  profileImageUrl: data.adminProfileImageUrl ?? null,
                }
              : undefined,
        }),
      );
      return true;
    } catch {
      return false;
    } finally {
      // bir sonraki refresh için yeniden başlat
      setTimeout(() => {
        refreshPromise = null;
      }, 0);
    }
  })();

  return refreshPromise;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Refresh endpoint'inin kendisi 401 dönerse zincire girmesin.
  const isRefreshCall =
    typeof args !== "string" && args.url?.includes("/api/auth/admin/refresh");

  if (result.error?.status === 401 && !isRefreshCall) {
    const refreshed = await tryRefresh(api, extraOptions);
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "AdminMe",
    "Users",
    "Appointments",
    "BarberStores",
    "Chairs",
    "Complaints",
    "Requests",
    "Ratings",
    "Favorites",
    "Blocked",
    "ChatThreads",
    "MediaFiles",
    "ServiceOfferings",
    "ServicePackages",
    "ManuelBarbers",
    "FreeBarbers",
    "SavedFilters",
    "Categories",
    "HelpGuides",
  ],
  endpoints: () => ({}),
});

// ---- Shared response shapes (backend Core.Utilities.Results) ----
export interface ApiResult<TData = unknown> {
  success: boolean;
  message: string;
  data?: TData;
}

export interface AccessTokenResponse {
  token: string;
  expiration: string;
  refreshToken: string;
  refreshTokenExpires: string;
  showHelpGuideOnboarding?: boolean;
  adminId?: string;
  adminEmail?: string;
  adminFullName?: string;
  adminProfileImageUrl?: string | null;
}
