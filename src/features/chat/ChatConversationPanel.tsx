import { useEffect, useMemo, useRef } from "react";
import UserAvatar from "../../components/common/UserAvatar";
import ChatMessageBubble from "./ChatMessageBubble";
import {
  useGetThreadMessagesQuery,
  type ChatThread,
} from "./chatApi";
import AppIcon from "../../components/icons/AppIcon";

export default function ChatConversationPanel({
  thread,
  onBack,
}: {
  thread: ChatThread;
  onBack?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data, isFetching, error } = useGetThreadMessagesQuery(
    { threadId: thread.threadId, page: 1, pageSize: 250 },
    { skip: !thread.threadId },
  );

  const participantMap = useMemo(
    () =>
      thread.participants.reduce<
        Record<string, { name: string; imageUrl?: string | null }>
      >((acc, p) => {
        acc[p.userId] = { name: p.displayName, imageUrl: p.imageUrl };
        return acc;
      }, {}),
    [thread.participants],
  );

  const messages = useMemo(
    () => (data?.items ?? []).slice().reverse(),
    [data?.items],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thread.threadId]);

  return (
    <>
      <div className="border-b border-brand-200/60 bg-brand-500/[0.06] px-4 py-2.5 dark:border-brand-500/20 dark:bg-brand-500/10">
        <p className="text-center text-xs font-medium text-brand-700 dark:text-brand-300">
          Salt okunur denetim görünümü — mesajları izleyebilirsiniz; yanıt gönderemezsiniz.
        </p>
      </div>
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-brand-500"
          >
            <AppIcon name="chevronLeft" className="size-4" />
            Geri
          </button>
        )}
        <UserAvatar
          firstName={thread.participants[0]?.displayName?.split(" ")[0]}
          lastName={thread.participants[0]?.displayName?.split(" ").slice(1).join(" ")}
          imageUrl={thread.participants[0]?.imageUrl ?? undefined}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-800 dark:text-white/90">
            {thread.title}
          </h3>
          <p className="text-xs text-gray-500">
            {thread.participants.length} katılımcı
            {data ? ` · ${data.total} mesaj` : ""}
          </p>
        </div>
      </div>

      {thread.participants.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-2 dark:border-white/[0.05]">
          {thread.participants.map((p) => (
            <div
              key={p.userId}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
            >
              <UserAvatar
                firstName={p.displayName.split(" ")[0]}
                lastName={p.displayName.split(" ").slice(1).join(" ")}
                imageUrl={p.imageUrl ?? undefined}
                size={20}
              />
              <span>{p.displayName}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {error ? (
          <p className="text-sm text-error-500">Mesajlar yüklenemedi.</p>
        ) : isFetching && messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Mesajlar yükleniyor...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Henüz mesaj yok.</p>
        ) : (
          <>
            {messages.map((m) => (
              <ChatMessageBubble key={m.messageId} msg={m} participantMap={participantMap} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-2 text-[10px] text-gray-400 dark:border-white/[0.05]">
        Silinmiş ve gizlenmiş mesajlar dahil tüm trafik gösterilir. Canlı sohbet veya mesaj gönderme yoktur.
      </div>
    </>
  );
}
