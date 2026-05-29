import { baseApi, type ApiResult } from "../../store/baseApi";

export interface AdminSavedFilter {
  id: string;
  userId?: string;
  name: string;
  filterCriteriaJson: string;
  filterSchemaVersion?: number;
  createdAt: string;
}

export const savedFiltersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSavedFilters: build.query<AdminSavedFilter[], void>({
      query: () => ({ url: "/api/admin/saved-filters", method: "GET" }),
      transformResponse: (res: ApiResult<AdminSavedFilter[]>) => res.data ?? [],
      providesTags: ["SavedFilters"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSavedFiltersQuery } = savedFiltersApi;
