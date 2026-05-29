import { baseApi, type ApiResult, type AccessTokenResponse } from "../../store/baseApi";

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminForgotPasswordRequest {
  email: string;
}

export interface AdminResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AdminLogoutRequest {
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminLogin: build.mutation<ApiResult<AccessTokenResponse>, AdminLoginRequest>({
      query: (body) => ({
        url: "/api/auth/admin/login",
        method: "POST",
        body,
      }),
    }),
    adminForgotPassword: build.mutation<ApiResult, AdminForgotPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/admin/forgot-password",
        method: "POST",
        body,
      }),
    }),
    adminResetPassword: build.mutation<ApiResult, AdminResetPasswordRequest>({
      query: (body) => ({
        url: "/api/auth/admin/reset-password",
        method: "POST",
        body,
      }),
    }),
    adminLogout: build.mutation<ApiResult, AdminLogoutRequest>({
      query: (body) => ({
        url: "/api/auth/admin/logout",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminLoginMutation,
  useAdminForgotPasswordMutation,
  useAdminResetPasswordMutation,
  useAdminLogoutMutation,
} = authApi;
