import { baseApi } from "../../store/baseApi";

export interface BroadcastRequest {
  title: string;
  body?: string;
  userType?: number | null;
  userIds?: string[];
}

export interface BroadcastResult {
  sent: number;
  failed: number;
  total: number;
}

export const broadcastApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    broadcastNotification: build.mutation<BroadcastResult, BroadcastRequest>({
      query: (body) => ({ url: "/api/admin/notifications/broadcast", method: "POST", body }),
      transformResponse: (res: { data: BroadcastResult }) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const { useBroadcastNotificationMutation } = broadcastApi;
