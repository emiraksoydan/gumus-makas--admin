import { baseApi, type ApiResult } from "../../store/baseApi";
import { AppointmentStatus } from "../appointments/appointmentsApi";
import { UserType } from "../users/usersApi";

export enum BarberType {
  None = 0,
  Store = 1,
  Free = 2,
}

export interface ChatThreadParticipant {
  userId: string;
  displayName: string;
  imageUrl?: string | null;
  userType: UserType;
  barberType?: BarberType | null;
}

export interface ChatThread {
  threadId: string;
  appointmentId?: string | null;
  status?: AppointmentStatus | null;
  isFavoriteThread: boolean;
  title: string;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  currentUserImageUrl?: string | null;
  participants: ChatThreadParticipant[];
  favoriteStoreId?: string | null;
  isRestrictedForCurrentUser?: boolean;
}

export interface AdminChatMessage {
  messageId: string;
  threadId: string;
  senderUserId: string;
  senderDisplayName?: string | null;
  text: string;
  messageType: number; // 0=Text, 1=Image, 2=Location, 3=File, 4=Audio
  mediaUrl?: string | null;
  replyToMessageId?: string | null;
  replyToTextPreview?: string | null;
  isSystem: boolean;
  createdAt: string;
  isDeletedGlobally: boolean;
  deletedByUserId?: string | null;
  deletedAt?: string | null;
  hiddenForUserIds: string[];
}

export interface AdminChatMessagesPaged {
  items: AdminChatMessage[];
  total: number;
  page: number;
  pageSize: number;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChatThreads: build.query<ChatThread[], void>({
      query: () => ({ url: "/api/admin/chat-threads", method: "GET" }),
      transformResponse: (res: ApiResult<ChatThread[]>) => res.data ?? [],
      providesTags: ["ChatThreads"],
    }),
    getThreadMessages: build.query<
      AdminChatMessagesPaged,
      { threadId: string; page?: number; pageSize?: number }
    >({
      query: ({ threadId, page = 1, pageSize = 100 }) => ({
        url: `/api/admin/chat-threads/${threadId}/messages?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      }),
      transformResponse: (res: ApiResult<AdminChatMessagesPaged>) =>
        res.data ?? { items: [], total: 0, page: 1, pageSize: 100 },
    }),
  }),
  overrideExisting: false,
});

export const { useGetChatThreadsQuery, useGetThreadMessagesQuery } = chatApi;
