import { baseApi, type ApiResult } from "../../store/baseApi";

export interface DailyEarning {
  date: string;
  amount: number;
}

export interface EarningsSummary {
  totalEarnings: number;
  dailyEarnings: number;
  previousPeriodEarnings: number;
  changePercent: number;
  dailyBreakdown: DailyEarning[];
}

export interface EarningAppointmentRow {
  appointmentId: string;
  completedAt: string;
  customerDisplayName?: string | null;
  counterpartyDisplayName?: string | null;
  servicesTotal: number;
  earningAmount: number;
  serviceSummary?: string | null;
}

export interface AdminEarningsDetail {
  summary: EarningsSummary;
  appointments: EarningAppointmentRow[];
}

export const adminEarningsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStoreEarnings: build.query<
      AdminEarningsDetail,
      { storeId: string; startDate: string; endDate: string }
    >({
      query: ({ storeId, startDate, endDate }) => ({
        url: `/api/admin/barberstores/${storeId}/earnings`,
        params: { startDate, endDate },
      }),
      transformResponse: (res: ApiResult<AdminEarningsDetail>) => res.data!,
    }),
    getFreeBarberEarnings: build.query<
      AdminEarningsDetail,
      { freeBarberUserId: string; startDate: string; endDate: string }
    >({
      query: ({ freeBarberUserId, startDate, endDate }) => ({
        url: `/api/admin/free-barbers/${freeBarberUserId}/earnings`,
        params: { startDate, endDate },
      }),
      transformResponse: (res: ApiResult<AdminEarningsDetail>) => res.data!,
    }),
  }),
});

export const { useGetStoreEarningsQuery, useGetFreeBarberEarningsQuery } = adminEarningsApi;
