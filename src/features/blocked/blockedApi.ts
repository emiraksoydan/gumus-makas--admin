import { baseApi, type ApiResult } from "../../store/baseApi";
import { UserType } from "../users/usersApi";

export interface AdminBlocked {
  id: string;
  blockedFromUserId: string;
  blockedToUserId: string;
  blockReason: string;
  createdAt: string;
  targetUserName?: string | null;
  targetUserImage?: string | null;
  targetUserType?: UserType | null;
  targetCustomerNumber?: string | null;
  blockedFromUserName?: string | null;
  blockedFromUserImage?: string | null;
  blockedFromUserType?: UserType | null;
  blockedFromCustomerNumber?: string | null;
}

export const blockedApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBlocked: build.query<AdminBlocked[], void>({
      query: () => ({ url: "/api/admin/blocked", method: "GET" }),
      transformResponse: (res: ApiResult<AdminBlocked[]>) => res.data ?? [],
      providesTags: ["Blocked"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBlockedQuery } = blockedApi;
