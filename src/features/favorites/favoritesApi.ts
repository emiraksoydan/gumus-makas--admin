import { baseApi, type ApiResult } from "../../store/baseApi";
import { UserType } from "../users/usersApi";

export enum FavoriteTargetType {
  Store = 1,
  FreeBarber = 2,
  Customer = 3,
  ManuelBarber = 4,
}

export const favoriteTargetTypeLabels: Record<FavoriteTargetType, string> = {
  [FavoriteTargetType.Store]: "Salon",
  [FavoriteTargetType.FreeBarber]: "Bağımsız Berber",
  [FavoriteTargetType.Customer]: "Müşteri",
  [FavoriteTargetType.ManuelBarber]: "Manuel Berber",
};

export interface AdminFavorite {
  id: string;
  favoritedFromId: string;
  favoritedToId: string;
  targetName?: string | null;
  targetImage?: string | null;
  targetNumber?: string | null;
  targetType: FavoriteTargetType;
  createdAt: string;
  favoritedFromName?: string | null;
  favoritedFromImage?: string | null;
  favoritedFromUserType?: UserType | null;
  favoritedFromCustomerNumber?: string | null;
}

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFavorites: build.query<AdminFavorite[], void>({
      query: () => ({ url: "/api/admin/favorites", method: "GET" }),
      transformResponse: (res: ApiResult<AdminFavorite[]>) => res.data ?? [],
      providesTags: ["Favorites"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFavoritesQuery } = favoritesApi;
