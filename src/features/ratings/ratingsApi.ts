import { baseApi, type ApiResult } from "../../store/baseApi";
import { UserType } from "../users/usersApi";

export interface AdminRating {
  id: string;
  targetId: string;
  ratedFromId: string;
  ratedFromName?: string | null;
  ratedFromImage?: string | null;
  ratedFromNumber?: string | null;
  ratedFromUserType?: UserType | null;
  score: number;
  comment?: string | null;
  appointmentId: string;
  createdAt: string;
  updatedAt: string;
  targetName?: string | null;
  targetImage?: string | null;
  targetTypeLabel?: string | null;
  targetNumber?: string | null;
}

export const ratingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRatings: build.query<AdminRating[], void>({
      query: () => ({ url: "/api/admin/ratings", method: "GET" }),
      transformResponse: (res: ApiResult<AdminRating[]>) => res.data ?? [],
      providesTags: ["Ratings"],
    }),
    // Belirli bir hedefe (store id / freebarber user id / manuel barber id / müşteri id)
    // yapılmış yorumlar — off-canvas içinde gösterim için.
    getRatingsByTarget: build.query<AdminRating[], string>({
      query: (targetId) => ({ url: `/api/admin/ratings/by-target/${targetId}`, method: "GET" }),
      transformResponse: (res: ApiResult<AdminRating[]>) => res.data ?? [],
      providesTags: ["Ratings"],
    }),
    deleteRating: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/ratings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Ratings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRatingsQuery,
  useGetRatingsByTargetQuery,
  useDeleteRatingMutation,
} = ratingsApi;
