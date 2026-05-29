import { baseApi, type ApiResult } from "../../store/baseApi";
import type { ServiceOwnerType } from "../serviceOfferings/serviceOfferingsApi";
import { serviceOwnerTypeLabels } from "../serviceOfferings/serviceOfferingsApi";

export interface ServicePackageItem {
  serviceOfferingId: string;
  serviceName: string;
}

export interface ServicePackage {
  id: string;
  ownerId: string;
  packageName: string;
  totalPrice: number;
  itemCount: number;
  items: ServicePackageItem[];
  // Sahip bilgisi (dükkan / serbest berber ayrımı + 6 haneli no + görsel)
  ownerType?: ServiceOwnerType;
  ownerName?: string | null;
  ownerNumber?: string | null;
  ownerImageUrl?: string | null;
}

export { serviceOwnerTypeLabels };

export const servicePackagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getServicePackages: build.query<ServicePackage[], void>({
      query: () => ({ url: "/api/admin/service-packages", method: "GET" }),
      transformResponse: (res: ApiResult<ServicePackage[]>) => res.data ?? [],
      providesTags: ["ServicePackages"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetServicePackagesQuery } = servicePackagesApi;
