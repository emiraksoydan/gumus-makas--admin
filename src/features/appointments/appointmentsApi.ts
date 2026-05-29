import { baseApi, type ApiResult } from "../../store/baseApi";

export enum AppointmentStatus {
  Pending = 0,
  Approved = 1,
  Completed = 2,
  Cancelled = 3,
  Rejected = 4,
  Unanswered = 5,
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Pending]: "Beklemede",
  [AppointmentStatus.Approved]: "Onaylı",
  [AppointmentStatus.Completed]: "Tamamlandı",
  [AppointmentStatus.Cancelled]: "İptal",
  [AppointmentStatus.Rejected]: "Reddedildi",
  [AppointmentStatus.Unanswered]: "Yanıtlanmadı",
};

export const appointmentStatusBadgeColor: Record<
  AppointmentStatus,
  "primary" | "success" | "warning" | "error" | "info"
> = {
  [AppointmentStatus.Pending]: "warning",
  [AppointmentStatus.Approved]: "info",
  [AppointmentStatus.Completed]: "success",
  [AppointmentStatus.Cancelled]: "error",
  [AppointmentStatus.Rejected]: "error",
  [AppointmentStatus.Unanswered]: "warning",
};

export enum AppointmentFilter {
  All = 0,
  Pending = 1,
  Approved = 2,
  Completed = 3,
  Cancelled = 4,
}

export interface AdminAppointment {
  id: string;
  status: AppointmentStatus;
  createdAt: string;
  appointmentDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  chairId?: string | null;
  chairName?: string | null;
  totalPrice: number;
  // Store
  storeId?: string | null;
  storeName?: string | null;
  storeImage?: string | null;
  storeAddressDescription?: string | null;
  storeNo?: string | null;
  // FreeBarber
  freeBarberId?: string | null;
  freeBarberName?: string | null;
  freeBarberImage?: string | null;
  freeBarberNumber?: string | null;
  // ManuelBarber
  manuelBarberId?: string | null;
  manuelBarberName?: string | null;
  manuelBarberImage?: string | null;
  // Customer
  customerUserId?: string | null;
  customerName?: string | null;
  customerImage?: string | null;
  customerNumber?: string | null;
  requestLatitude?: number | null;
  requestLongitude?: number | null;
  services?: { serviceId: string; serviceName: string; price: number }[];
  packages?: {
    packageId: string;
    packageName: string;
    totalPrice: number;
    serviceNamesSnapshot?: string;
  }[];
}

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAppointments: build.query<AdminAppointment[], AppointmentFilter | void>({
      query: (filter) => {
        const f = filter ?? AppointmentFilter.All;
        return { url: `/api/admin/appointments?filter=${f}`, method: "GET" };
      },
      transformResponse: (res: ApiResult<AdminAppointment[]>) => res.data ?? [],
      providesTags: ["Appointments"],
    }),
    adminCancelAppointment: build.mutation<void, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/api/admin/appointments/${id}/cancel`,
        method: "PATCH",
        body: { reason: reason ?? null },
      }),
      invalidatesTags: ["Appointments"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAppointmentsQuery, useAdminCancelAppointmentMutation } = appointmentsApi;
