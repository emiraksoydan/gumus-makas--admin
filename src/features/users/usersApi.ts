import { baseApi, type ApiResult } from "../../store/baseApi";

// Backend: Entities.Concrete.Enums.UserType
export enum UserType {
  Customer = 0,
  FreeBarber = 1,
  BarberStore = 2,
}

// Backend: Entities.Concrete.Dto.UserAdminGetDto
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: UserType;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string | null;
  customerNumber: string;
  imageId?: string | null;
  imageUrl?: string | null;
  /** Bu kullanıcıyı favorileyen aktif kişi sayısı. */
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BanUserRequest {
  userId: string;
  reason?: string | null;
}

export interface SetSubscriptionRequest {
  userId: string;
  endDate: string; // ISO
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<AdminUser[], void>({
      query: () => ({ url: "/api/admin/users", method: "GET" }),
      transformResponse: (response: ApiResult<AdminUser[]>) => response.data ?? [],
      providesTags: ["Users"],
    }),
    banUser: build.mutation<ApiResult, BanUserRequest>({
      query: ({ userId, reason }) => ({
        url: `/api/admin/users/${userId}/ban`,
        method: "POST",
        body: { reason: reason ?? null },
      }),
      invalidatesTags: ["Users"],
    }),
    unbanUser: build.mutation<ApiResult, string>({
      query: (userId) => ({
        url: `/api/admin/users/${userId}/unban`,
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),
    setSubscription: build.mutation<ApiResult, SetSubscriptionRequest>({
      query: ({ userId, endDate }) => ({
        url: `/api/admin/users/${userId}/subscription`,
        method: "POST",
        body: { endDate },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useSetSubscriptionMutation,
} = usersApi;
