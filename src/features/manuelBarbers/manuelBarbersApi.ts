import { baseApi, type ApiResult } from "../../store/baseApi";

export interface ManuelBarber {
  id: string;
  fullName: string;
  ownerUserId?: string | null;
  ownerName?: string | null;
  imageUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  // Bağlı salon bilgisi (backend dönüyorsa)
  storeId?: string | null;
  storeName?: string | null;
  storeNo?: string | null;
  storeImageUrl?: string | null;
}

export const manuelBarbersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getManuelBarbers: build.query<ManuelBarber[], void>({
      query: () => ({ url: "/api/admin/manuel-barbers", method: "GET" }),
      transformResponse: (res: ApiResult<ManuelBarber[]>) => res.data ?? [],
      providesTags: ["ManuelBarbers"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetManuelBarbersQuery } = manuelBarbersApi;
