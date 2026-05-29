import { baseApi, type ApiResult } from "../../store/baseApi";

export interface BarberChair {
  id: string;
  storeId: string;
  name?: string | null;
  storeName?: string | null;
  storeNo?: string | null;
  manuelBarberId?: string | null;
  manuelBarberName?: string | null;
  isAvailable: boolean;
}

export const chairsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChairs: build.query<BarberChair[], void>({
      query: () => ({ url: "/api/admin/chairs", method: "GET" }),
      transformResponse: (res: ApiResult<BarberChair[]>) => res.data ?? [],
      providesTags: ["Chairs"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetChairsQuery } = chairsApi;
