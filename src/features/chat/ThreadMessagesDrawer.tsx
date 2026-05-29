import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { useGetThreadMessagesQuery, type ChatThread } from "./chatApi";
import ChatMessageBubble from "./ChatMessageBubble";
import UserAvatar from "../../components/common/UserAvatar";
import { useAnimatedMount } from "../../hooks/useAnimatedMount";

interface ThreadMessagesDrawerProps {
  thread: ChatThread | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ThreadMessagesDrawer({
  thread,
  isOpen,
  onClose,
}: ThreadMessagesDrawerProps) {
  const { data, isFetching, error } = useGetThreadMessagesQuery(
    thread ? { threadId: thread.threadId, page: 1, pageSize: 250 } : { threadId: "" },
    { skip: !thread || !isOpen },
  );
  const drawerRef = useRef<HTMLDivElement>(null);
  const { shouldRender, state } = useAnimatedMount(isOpen, 300);

  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", onKey);
      };
    }
  }, [shouldRender, onClose]);

  const participantMap = useMemo(
    () =>
      (thread?.participants ?? []).reduce<
        Record<string, { name: string; imageUrl?: string | null }>
      >((acc, p) => {
        acc[p.userId] = { name: p.displayName, imageUrl: p.imageUrl };
        return acc;
      }, {}),
    [thread?.participants],
  );

  if (!shouldRender || !thread) return null;

  const messages = (data?.items ?? []).slice().reverse();

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex">
      <div
        className="gm-overlay-backdrop fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
        data-state={state}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        data-state={state}
        className="gm-drawer-panel relative ml-auto flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl dark:bg-gray-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
          <div className="flex flex-1 items-center gap-3">
            <UserAvatar
              firstName={thread.participants[0]?.displayName?.split(" ")[0]}
              lastName={thread.participants[0]?.displayName?.split(" ").slice(1).join(" ")}
              imageUrl={thread.participants[0]?.imageUrl ?? undefined}
              size={48}
            />
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {thread.title}
              </h3>
              <Link
                to={`/chat/${thread.threadId}`}
                className="text-xs text-brand-500 hover:underline"
                onClick={onClose}
              >
                Tam ekran sohbet görünümü →
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="text-sm text-error-500">Mesajlar yüklenemedi.</p>
          ) : isFetching && messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500">Yükleniyor...</p>
          ) : (
            messages.map((m) => (
              <ChatMessageBubble key={m.messageId} msg={m} participantMap={participantMap} />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
