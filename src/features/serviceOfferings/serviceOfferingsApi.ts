import { baseApi, type ApiResult } from "../../store/baseApi";

export type ServiceOwnerType = "Store" | "FreeBarber" | "Unknown";

export interface ServiceOffering {
  id: string;
  name?: string | null;
  serviceName?: string | null;
  description?: string | null;
  price: number;
  durationMinutes?: number;
  categoryId?: string | null;
  categoryName?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
  // Sahip bilgisi (dükkan / serbest berber ayrımı + 6 haneli no + görsel)
  ownerType?: ServiceOwnerType;
  ownerNumber?: string | null;
  ownerImageUrl?: string | null;
}

export const serviceOwnerTypeLabels: Record<ServiceOwnerType, string> = {
  Store: "Berber Dükkanı",
  FreeBarber: "Serbest Berber",
  Unknown: "Bilinmiyor",
};

export const serviceOfferingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServiceOfferings: build.query<ServiceOffering[], void>({
      query: () => ({ url: "/api/admin/service-offerings", method: "GET" }),
      transformResponse: (res: ApiResult<ServiceOffering[]>) => res.data ?? [],
      providesTags: ["ServiceOfferings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetServiceOfferingsQuery } = serviceOfferingsApi;
