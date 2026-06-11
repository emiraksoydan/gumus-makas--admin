import { baseApi, type ApiResult } from "../../store/baseApi";

export enum SocialContentStatus {
  Active = 0,
  Hidden = 1,
  Removed = 2,
}

export enum SocialPostType {
  Photo = 0,
  Carousel = 1,
  Video = 2,
  Reel = 3,
}

export enum SocialProfileOwnerType {
  Customer = 0,
  FreeBarber = 1,
  BarberStore = 2,
}

export interface SocialPostAdmin {
  id: string;
  profileId: string;
  profileUsername: string;
  ownerType: SocialProfileOwnerType;
  caption?: string | null;
  type: SocialPostType;
  status: SocialContentStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  mediaCount: number;
  thumbnailUrl?: string | null;
  createdAt: string;
}

export interface SocialStoryAdmin {
  id: string;
  profileId: string;
  profileUsername: string;
  ownerType: SocialProfileOwnerType;
  status: SocialContentStatus;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  durationSec?: number | null;
  expiresAt: string;
  createdAt: string;
}

export interface SocialStoryHighlightAdmin {
  id: string;
  profileId: string;
  profileUsername: string;
  ownerType: SocialProfileOwnerType;
  title: string;
  coverUrl?: string | null;
  itemCount: number;
  sortOrder: number;
  status: SocialContentStatus;
  createdAt: string;
}

export interface SocialProfileAdmin {
  id: string;
  username: string;
  ownerType: SocialProfileOwnerType;
  ownerId: string;
  userId: string;
  bio?: string | null;
  avatarUrl?: string | null;
  status: SocialContentStatus;
  postCount: number;
  followerCount: number;
  followingCount: number;
  ownerDisplayName?: string | null;
  ownerNumber?: string | null;
  createdAt: string;
}

export interface SocialModerationListParams {
  status?: SocialContentStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

function buildQuery(params: SocialModerationListParams) {
  const q = new URLSearchParams();
  if (params.status != null) q.set("status", String(params.status));
  if (params.search?.trim()) q.set("search", params.search.trim());
  q.set("page", String(params.page ?? 1));
  q.set("pageSize", String(params.pageSize ?? 25));
  return q.toString();
}

export const socialContentStatusLabels: Record<SocialContentStatus, string> = {
  [SocialContentStatus.Active]: "Aktif",
  [SocialContentStatus.Hidden]: "Gizli",
  [SocialContentStatus.Removed]: "Kaldırıldı",
};

export const socialPostTypeLabels: Record<SocialPostType, string> = {
  [SocialPostType.Photo]: "Fotoğraf",
  [SocialPostType.Carousel]: "Carousel",
  [SocialPostType.Video]: "Video",
  [SocialPostType.Reel]: "Reel",
};

export const socialOwnerTypeLabels: Record<SocialProfileOwnerType, string> = {
  [SocialProfileOwnerType.Customer]: "Müşteri",
  [SocialProfileOwnerType.FreeBarber]: "Serbest Berber",
  [SocialProfileOwnerType.BarberStore]: "Salon",
};

export const socialModerationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSocialPostsAdmin: build.query<SocialPostAdmin[], SocialModerationListParams>({
      query: (params) => ({
        url: `/api/admin/social/posts?${buildQuery(params)}`,
        method: "GET",
      }),
      transformResponse: (res: ApiResult<SocialPostAdmin[]>) => res.data ?? [],
      providesTags: ["SocialPosts"],
    }),
    getSocialStoriesAdmin: build.query<SocialStoryAdmin[], SocialModerationListParams>({
      query: (params) => ({
        url: `/api/admin/social/stories?${buildQuery(params)}`,
        method: "GET",
      }),
      transformResponse: (res: ApiResult<SocialStoryAdmin[]>) => res.data ?? [],
      providesTags: ["SocialStories"],
    }),
    getSocialProfilesAdmin: build.query<SocialProfileAdmin[], SocialModerationListParams>({
      query: (params) => ({
        url: `/api/admin/social/profiles?${buildQuery(params)}`,
        method: "GET",
      }),
      transformResponse: (res: ApiResult<SocialProfileAdmin[]>) => res.data ?? [],
      providesTags: ["SocialProfiles"],
    }),
    getSocialHighlightsAdmin: build.query<SocialStoryHighlightAdmin[], SocialModerationListParams>({
      query: (params) => ({
        url: `/api/admin/social/highlights?${buildQuery(params)}`,
        method: "GET",
      }),
      transformResponse: (res: ApiResult<SocialStoryHighlightAdmin[]>) => res.data ?? [],
      providesTags: ["SocialHighlights"],
    }),
    removeSocialPostAdmin: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/social/posts/${id}`, method: "DELETE" }),
      invalidatesTags: ["SocialPosts"],
    }),
    removeSocialStoryAdmin: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/social/stories/${id}`, method: "DELETE" }),
      invalidatesTags: ["SocialStories"],
    }),
    removeSocialProfileAdmin: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/social/profiles/${id}`, method: "DELETE" }),
      invalidatesTags: ["SocialPosts", "SocialStories", "SocialProfiles", "SocialHighlights"],
    }),
    removeSocialHighlightAdmin: build.mutation<void, string>({
      query: (id) => ({ url: `/api/admin/social/highlights/${id}`, method: "DELETE" }),
      invalidatesTags: ["SocialHighlights"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSocialPostsAdminQuery,
  useGetSocialStoriesAdminQuery,
  useGetSocialProfilesAdminQuery,
  useGetSocialHighlightsAdminQuery,
  useRemoveSocialPostAdminMutation,
  useRemoveSocialStoryAdminMutation,
  useRemoveSocialProfileAdminMutation,
  useRemoveSocialHighlightAdminMutation,
} = socialModerationApi;
