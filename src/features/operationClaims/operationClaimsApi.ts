import { baseApi, type ApiResult } from "../../store/baseApi";

export interface OperationClaim {
  id: string;
  name: string;
}

export const operationClaimsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOperationClaims: build.query<OperationClaim[], void>({
      query: () => ({ url: "/api/admin/operation-claims", method: "GET" }),
      transformResponse: (res: ApiResult<OperationClaim[]>) => res.data ?? [],
    }),
  }),
  overrideExisting: false,
});

export const { useGetOperationClaimsQuery } = operationClaimsApi;
