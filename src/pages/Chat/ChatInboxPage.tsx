import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserAvatar from "../../components/common/UserAvatar";
import Badge from "../../components/ui/badge/Badge";
import ChatMessageBubble from "../../features/chat/ChatMessageBubble";
import {
  useGetChatThreadsQuery,
  useGetThreadMessagesQuery,
  type ChatThread,
} from "../../features/chat/chatApi";
import { ChatIcon } from "../../icons";

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function ChatInboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const threadParam = searchParams.get("thread");

  const { data: threads = [], isLoading, error, refetch } = useGetChatThreadsQuery();
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(threadParam);

  useEffect(() => {
    if (threadParam) setSelectedId(threadParam);
  }, [threadParam]);

  const filteredThreads = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.lastMessagePreview?.toLowerCase().includes(q) ||
        t.participants.some((p) => p.displayName.toLowerCase().includes(q)),
    );
  }, [threads, filter]);

  const selected = useMemo(
    () => threads.find((t) => t.threadId === selectedId) ?? null,
    [threads, selectedId],
  );

  const selectThread = (t: ChatThread) => {
    setSelectedId(t.threadId);
    setSearchParams({ thread: t.threadId });
  };

  return (
    <>
      <PageMeta title="Sohbet | Gümüş Makas Admin" description="Admin sohbet görünümü" />
      <PageBreadcrumb pageTitle="Sohbet" />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600">
          Sohbetler yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex h-[calc(100vh-200px)] min-h-[520px]">
          {/* Sol: thread listesi */}
          <div className="flex w-full max-w-sm flex-col border-r border-gray-100 dark:border-white/[0.05]">
            <div className="border-b border-gray-100 p-4 dark:border-white/[0.05]">
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Sohbet veya kişi ara..."
                className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:text-white/90"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <p className="p-4 text-center text-sm text-gray-500">Yükleniyor...</p>
              ) : filteredThreads.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">Sohbet bulunamadı.</p>
              ) : (
                filteredThreads.map((t) => {
                  const active = t.threadId === selectedId;
                  const first = t.participants[0];
                  return (
                    <button
                      key={t.threadId}
                      type="button"
                      onClick={() => selectThread(t)}
                      className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition dark:border-white/[0.03] ${
                        active
                          ? "bg-brand-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <UserAvatar
                        firstName={first?.displayName?.split(" ")[0]}
                        lastName={first?.displayName?.split(" ").slice(1).join(" ")}
                        imageUrl={first?.imageUrl ?? undefined}
                        size={44}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                            {t.title}
                          </span>
                          {t.unreadCount > 0 && (
                            <Badge size="sm" color="warning">
                              {t.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {t.lastMessagePreview ?? "Mesaj yok"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {t.isFavoriteThread ? (
                            <span className="text-[10px] text-pink-500">Favori</span>
                          ) : (
                            <span className="text-[10px] text-brand-500">Randevu</span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            {formatDate(t.lastMessageAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Sağ: mesajlar */}
          <div className="hidden flex-1 flex-col md:flex">
            {selected ? (
              <ChatConversationPanel thread={selected} />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
                <ChatIcon className="size-12 opacity-40" />
                <p className="text-sm">Görüntülemek için bir sohbet seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobil: seçili sohbet tam ekran drawer benzeri */}
      {selected && (
        <div className="fixed inset-0 z-99999 flex flex-col bg-white dark:bg-gray-900 md:hidden">
          <ChatConversationPanel thread={selected} onBack={() => setSelectedId(null)} />
        </div>
      )}
    </>
  );
}

function ChatConversationPanel({
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
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
        {onBack && (
          <button type="button" onClick={onBack} className="text-sm text-brand-500">
            ← Geri
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
        Admin denetim görünümü — silinmiş ve gizlenmiş mesajlar dahil tüm trafik gösterilir.
      </div>
    </>
  );
}
