import { baseApi, type ApiResult } from "../../store/baseApi";

export interface FreeBarberAdmin {
  id: string;
  freeBarberUserId: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  type: number;
  rating: number;
  favoriteCount: number;
  isAvailable: boolean;
  reviewCount: number;
  latitude: number;
  longitude: number;
  customerNumber?: string | null;
  imageList?: { id: string; imageUrl: string }[];
  offerings?: { id: string; serviceName: string; price: number }[];
  barberCertificateImageId?: string | null;
  beautySalonCertificateImageId?: string | null;
  barberCertificateImage?: { id: string; imageUrl: string } | null;
  beautySalonCertificateImage?: { id: string; imageUrl: string } | null;
  isSuspended?: boolean;
  suspendReason?: string | null;
  servicePackages?: {
    id: string;
    packageName: string;
    totalPrice: number;
    items?: { serviceOfferingId: string; serviceName: string }[];
  }[];
}

export const freeBarbersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFreeBarbers: build.query<FreeBarberAdmin[], void>({
      query: () => ({ url: "/api/admin/free-barbers", method: "GET" }),
      transformResponse: (res: ApiResult<FreeBarberAdmin[]>) => res.data ?? [],
      providesTags: ["FreeBarbers"],
    }),
    suspendFreeBarber: build.mutation<void, { id: string; suspend: boolean; reason?: string }>({
      query: ({ id, suspend, reason }) => ({
        url: `/api/admin/free-barbers/${id}/suspend`,
        method: "PATCH",
        body: { suspend, reason: reason ?? null },
      }),
      invalidatesTags: ["FreeBarbers"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFreeBarbersQuery, useSuspendFreeBarberMutation } = freeBarbersApi;
