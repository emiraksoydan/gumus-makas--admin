import { baseApi, type ApiResult } from "../../store/baseApi";
import { UserType } from "../users/usersApi";

export interface AdminComplaint {
  id: string;
  complaintFromUserId: string;
  complaintToUserId: string;
  appointmentId?: string | null;
  complaintReason: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string | null;
  resolvedByAdminId?: string | null;
  targetUserName?: string | null;
  targetUserImage?: string | null;
  targetUserType?: UserType | null;
  targetCustomerNumber?: string | null;
  complaintFromUserName?: string | null;
  complaintFromUserImage?: string | null;
  complaintFromUserType?: UserType | null;
  complaintFromCustomerNumber?: string | null;
}

export const complaintsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getComplaints: build.query<AdminComplaint[], void>({
      query: () => ({ url: "/api/admin/complaints", method: "GET" }),
      transformResponse: (res: ApiResult<AdminComplaint[]>) => res.data ?? [],
      providesTags: ["Complaints"],
    }),
    resolveComplaint: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/admin/complaints/${id}/resolve`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: ["Complaints"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetComplaintsQuery, useResolveComplaintMutation } = complaintsApi;
