import { baseApi, type ApiResult } from "../../store/baseApi";

export interface AdminMediaFile {
  id: string;
  mediaUrl: string;
  mediaKind: "image" | "audio" | "file" | "video" | string;
  category: string;
  categoryLabel: string;
  contextTitle?: string | null;
  senderDisplayName?: string | null;
  senderUserId?: string | null;
  ownerId?: string | null;
  threadId?: string | null;
  fileName?: string | null;
  createdAt: string;
  /** Dosya boyutu (byte) — backend sağlarsa gösterilir */
  sizeBytes?: number | null;
  /** Sahip varlığın adı: dükkan adı / panel adı / kullanıcı adı */
  ownerName?: string | null;
  /** Sahip varlığın 6 haneli kodu (salon no / berber no / müşteri no) */
  ownerNumber?: string | number | null;
}

export interface AdminMediaFilesPaged {
  items: AdminMediaFile[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminMediaCategoryStat {
  categoryId: string;
  label: string;
  count: number;
  sizeBytes?: number | null;
}

export interface AdminMediaStats {
  totalFiles: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  fileCount: number;
  categories: AdminMediaCategoryStat[];
  /** Toplam boyut (byte) — backend sağlarsa gösterilir */
  totalSizeBytes?: number | null;
  imageSizeBytes?: number | null;
  videoSizeBytes?: number | null;
  audioSizeBytes?: number | null;
  fileSizeBytes?: number | null;
}

export const MEDIA_CATEGORIES = [
  { id: "all", label: "Tümü" },
  { id: "user", label: "Kullanıcı profili" },
  { id: "store", label: "Berber salonu" },
  { id: "freebarber", label: "Serbest berber" },
  { id: "manuelbarber", label: "Manuel berber" },
  { id: "chat-image", label: "Sohbet görselleri" },
  { id: "chat-audio", label: "Sohbet sesleri" },
  { id: "chat-file", label: "Sohbet dosyaları" },
] as const;

export const adminMediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMediaFiles: build.query<
      AdminMediaFilesPaged,
      { category?: string; search?: string; page?: number; pageSize?: number }
    >({
      query: ({ category = "all", search = "", page = 1, pageSize = 24 }) => {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (category && category !== "all") params.set("category", category);
        if (search.trim()) params.set("search", search.trim());
        return { url: `/api/admin/media-files?${params}`, method: "GET" };
      },
      transformResponse: (res: ApiResult<AdminMediaFilesPaged>) =>
        res.data ?? { items: [], total: 0, page: 1, pageSize: 24 },
      providesTags: ["MediaFiles"],
    }),
    getMediaStats: build.query<AdminMediaStats, void>({
      query: () => ({ url: "/api/admin/media-files/stats", method: "GET" }),
      transformResponse: (res: ApiResult<AdminMediaStats>) =>
        res.data ?? {
          totalFiles: 0,
          imageCount: 0,
          videoCount: 0,
          audioCount: 0,
          fileCount: 0,
          categories: [],
        },
      providesTags: ["MediaFiles"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMediaFilesQuery, useGetMediaStatsQuery } = adminMediaApi;
