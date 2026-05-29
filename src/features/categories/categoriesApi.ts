import { baseApi, type ApiResult } from "../../store/baseApi";

export interface CategoryNode {
  id: string;
  name: string;
  children: CategoryNode[];
}

export interface CategoryUpsertRequest {
  name: string;
  parentId?: string | null;
}

export interface CategoryDeleteRequest {
  reparentTo?: string | null;
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategoryHierarchy: build.query<CategoryNode[], void>({
      query: () => ({ url: "/api/admin/categories/hierarchy", method: "GET" }),
      transformResponse: (res: ApiResult<CategoryNode[]>) => res.data ?? [],
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<ApiResult, CategoryUpsertRequest>({
      query: (body) => ({ url: "/api/admin/categories", method: "POST", body }),
      // Kategori değişiklikleri service offerings'i de etkiler
      invalidatesTags: ["Categories", "ServiceOfferings"],
    }),
    updateCategory: build.mutation<ApiResult, { id: string } & CategoryUpsertRequest>({
      query: ({ id, ...body }) => ({
        url: `/api/admin/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Categories", "ServiceOfferings"],
    }),
    deleteCategory: build.mutation<ApiResult, { id: string; reparentTo?: string | null }>({
      query: ({ id, reparentTo }) => ({
        url: `/api/admin/categories/${id}`,
        method: "DELETE",
        body: { reparentTo: reparentTo ?? null },
      }),
      invalidatesTags: ["Categories", "ServiceOfferings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoryHierarchyQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
