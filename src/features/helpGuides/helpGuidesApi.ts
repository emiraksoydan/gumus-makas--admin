import { baseApi, type ApiResult } from "../../store/baseApi";
import { UserType } from "../users/usersApi";

export interface HelpGuide {
  id: string;
  userType: number; // UserType enum int
  title: string;
  description: string;
  translationKey: string;
  order: number;
  isActive: boolean;
}

export interface HelpGuideCreateRequest {
  userType: UserType;
  title: string;
  description: string;
  translationKey?: string;
  order: number;
  isActive: boolean;
}

export interface HelpGuideUpdateRequest extends HelpGuideCreateRequest {
  id: string;
}

export const helpGuidesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHelpGuides: build.query<HelpGuide[], { userType?: number } | void>({
      query: (params) => {
        const userType = params?.userType;
        const qs = userType !== undefined ? `?userType=${userType}` : "";
        return { url: `/api/admin/help-guides${qs}`, method: "GET" };
      },
      transformResponse: (res: ApiResult<HelpGuide[]>) => res.data ?? [],
      providesTags: ["HelpGuides"],
    }),
    createHelpGuide: build.mutation<ApiResult<HelpGuide>, HelpGuideCreateRequest>({
      query: (body) => ({ url: "/api/admin/help-guides", method: "POST", body }),
      invalidatesTags: ["HelpGuides"],
    }),
    updateHelpGuide: build.mutation<ApiResult, HelpGuideUpdateRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/admin/help-guides/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["HelpGuides"],
    }),
    deleteHelpGuide: build.mutation<ApiResult, string>({
      query: (id) => ({ url: `/api/admin/help-guides/${id}`, method: "DELETE" }),
      invalidatesTags: ["HelpGuides"],
    }),
    setHelpGuideActive: build.mutation<ApiResult, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/api/admin/help-guides/${id}/active`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["HelpGuides"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHelpGuidesQuery,
  useCreateHelpGuideMutation,
  useUpdateHelpGuideMutation,
  useDeleteHelpGuideMutation,
  useSetHelpGuideActiveMutation,
} = helpGuidesApi;
