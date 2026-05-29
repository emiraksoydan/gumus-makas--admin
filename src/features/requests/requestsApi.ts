import { baseApi, type ApiResult } from "../../store/baseApi";
import { UserType } from "../users/usersApi";

export interface AdminRequest {
  id: string;
  requestFromUserId: string;
  requestTitle: string;
  requestMessage: string;
  createdAt: string;
  isProcessed: boolean;
  requestFromUserName?: string | null;
  requestFromUserType?: UserType | null;
  requestFromCustomerNumber?: string | null;
}

export const requestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRequests: build.query<AdminRequest[], void>({
      query: () => ({ url: "/api/admin/requests", method: "GET" }),
      transformResponse: (res: ApiResult<AdminRequest[]>) => res.data ?? [],
      providesTags: ["Requests"],
    }),
    markRequestProcessed: build.mutation<void, { id: string; isProcessed: boolean }>({
      query: ({ id, isProcessed }) => ({
        url: `/api/admin/requests/${id}/process`,
        method: "PATCH",
        body: { isProcessed },
      }),
      invalidatesTags: ["Requests"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRequestsQuery, useMarkRequestProcessedMutation } = requestsApi;
