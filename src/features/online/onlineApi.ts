import { baseApi } from "../../store/baseApi";

export interface OnlineCountDto {
  total: number;
  customers: number;
  freeBarbers: number;
  stores: number;
}

export const onlineApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOnlineCount: build.query<OnlineCountDto, void>({
      query: () => ({ url: "/api/admin/online-users/count", method: "GET" }),
      transformResponse: (res: { data: OnlineCountDto }) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetOnlineCountQuery } = onlineApi;
