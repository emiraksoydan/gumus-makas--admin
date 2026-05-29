import { baseApi, type ApiResult } from "../../store/baseApi";
import type { RootState } from "../../store/store";
import { getAdminIdFromToken } from "../../utils/jwt";

export interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  profileImageUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateAdminProfileRequest {
  email: string;
  fullName: string;
}

export interface ChangeAdminPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const adminsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdmins: build.query<AdminUserItem[], void>({
      query: () => ({ url: "/api/admin/admins", method: "GET" }),
      transformResponse: (res: ApiResult<AdminUserItem[]>) => res.data ?? [],
      providesTags: ["AdminMe"],
    }),
    createAdmin: build.mutation<ApiResult<AdminUserItem>, CreateAdminRequest>({
      query: (body) => ({ url: "/api/admin/admins", method: "POST", body }),
      invalidatesTags: ["AdminMe"],
    }),
    setAdminActive: build.mutation<ApiResult, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/admin/admins/${id}/active`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["AdminMe"],
    }),
    deleteAdmin: build.mutation<ApiResult, string>({
      query: (id) => ({ url: `/api/admin/admins/${id}`, method: "DELETE" }),
      invalidatesTags: ["AdminMe"],
    }),
    getMyAdminProfile: build.query<AdminUserItem | null, void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        const primary = await baseQuery({ url: "/api/admin/admins/me", method: "GET" });
        if (!primary.error) {
          const body = primary.data as ApiResult<AdminUserItem>;
          return { data: body.data ?? null };
        }

        const status = primary.error.status;
        if (status !== 404 && status !== 405) {
          return { error: primary.error };
        }

        const authFallback = await baseQuery({ url: "/api/auth/admin/me", method: "GET" });
        if (!authFallback.error) {
          const body = authFallback.data as ApiResult<AdminUserItem>;
          return { data: body.data ?? null };
        }

        const state = api.getState() as RootState;
        const adminId =
          state.auth.admin?.id ??
          (state.auth.token ? getAdminIdFromToken(state.auth.token) : undefined);

        const listResult = await baseQuery({ url: "/api/admin/admins", method: "GET" });
        if (listResult.error) {
          return { error: listResult.error };
        }

        const list = (listResult.data as ApiResult<AdminUserItem[]>).data ?? [];
        if (adminId) {
          const found = list.find((a) => a.id === adminId);
          if (found) return { data: found };
        }

        const email = state.auth.admin?.email?.toLowerCase();
        if (email) {
          const byEmail = list.find((a) => a.email.toLowerCase() === email);
          if (byEmail) return { data: byEmail };
        }

        return { data: null };
      },
      providesTags: ["AdminMe"],
    }),
    updateMyAdminProfile: build.mutation<ApiResult<AdminUserItem>, UpdateAdminProfileRequest>({
      query: (body) => ({ url: "/api/admin/admins/me", method: "PUT", body }),
      invalidatesTags: ["AdminMe"],
    }),
    changeMyAdminPassword: build.mutation<ApiResult, ChangeAdminPasswordRequest>({
      query: (body) => ({
        url: "/api/admin/admins/me/change-password",
        method: "POST",
        body,
      }),
    }),
    uploadMyAdminAvatar: build.mutation<ApiResult<AdminUserItem>, File>({
      query: (file) => {
        const form = new FormData();
        form.append("File", file);
        return {
          url: "/api/admin/admins/me/avatar",
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: ["AdminMe"],
    }),
    removeMyAdminAvatar: build.mutation<ApiResult<AdminUserItem>, void>({
      query: () => ({ url: "/api/admin/admins/me/avatar", method: "DELETE" }),
      invalidatesTags: ["AdminMe"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useSetAdminActiveMutation,
  useDeleteAdminMutation,
  useGetMyAdminProfileQuery,
  useUpdateMyAdminProfileMutation,
  useChangeMyAdminPasswordMutation,
  useUploadMyAdminAvatarMutation,
  useRemoveMyAdminAvatarMutation,
} = adminsApi;
