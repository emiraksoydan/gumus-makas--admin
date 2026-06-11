import { baseApi, type ApiResult } from "../../store/baseApi";

export interface BarberStore {
  id: string;
  barberStoreOwnerId?: string | null;
  storeName: string;
  pricingType: string;
  pricingValue: number;
  type: number; // BarberType: 1=Store, 2=Free
  rating: number;
  favoriteCount: number;
  completedAppointmentCount?: number;
  totalEarnings?: number;
  addressDescription?: string | null;
  latitude?: number;
  longitude?: number;
  isOpenNow?: boolean;
  reviewCount?: number;
  storeNo?: string | null;
  imageList?: { id: string; imageUrl: string }[];
  serviceOfferings?: { id?: string; serviceName: string; price: number }[];
  offerings?: { id?: string; serviceName: string; price: number }[];
  taxDocumentImageId?: string | null;
  taxDocumentImage?: { id: string; imageUrl: string } | null;
  isSuspended?: boolean;
  suspendReason?: string | null;
  servicePackages?: {
    id: string;
    packageName: string;
    totalPrice: number;
    items?: { serviceOfferingId: string; serviceName: string }[];
  }[];
  workingHours?: {
    id: string;
    dayOfWeek: number;
    startTime?: string | null;
    endTime?: string | null;
    isClosed: boolean;
  }[];
  chairs?: {
    id: string;
    name?: string | null;
    manuelBarberId?: string | null;
    manuelBarberName?: string | null;
    isAvailable?: boolean | null;
  }[];
  manuelBarbers?: {
    id: string;
    fullName: string;
    profileImageUrl?: string | null;
    rating?: number;
  }[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const barberStoresApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBarberStores: build.query<BarberStore[], void>({
      query: () => ({ url: "/api/admin/barberstores", method: "GET" }),
      transformResponse: (res: ApiResult<BarberStore[]>) => res.data ?? [],
      providesTags: ["BarberStores"],
    }),
    suspendBarberStore: build.mutation<void, { id: string; suspend: boolean; reason?: string }>({
      query: ({ id, suspend, reason }) => ({
        url: `/api/admin/barberstores/${id}/suspend`,
        method: "PATCH",
        body: { suspend, reason: reason ?? null },
      }),
      invalidatesTags: ["BarberStores"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBarberStoresQuery, useSuspendBarberStoreMutation } = barberStoresApi;
