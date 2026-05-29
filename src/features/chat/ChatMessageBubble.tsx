import UserAvatar from "../../components/common/UserAvatar";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import type { AdminChatMessage } from "./chatApi";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ChatMessageBubble({
  msg,
  participantMap,
}: {
  msg: AdminChatMessage;
  participantMap: Record<string, { name: string; imageUrl?: string | null }>;
}) {
  const isSystem = msg.isSystem;
  const isHidden = msg.isDeletedGlobally || msg.hiddenForUserIds.length > 0;
  const sender = participantMap[msg.senderUserId];
  const senderName = sender?.name ?? msg.senderDisplayName ?? "Bilinmiyor";
  const senderImage = sender?.imageUrl ?? null;
  const mediaSrc = resolveMediaUrl(msg.mediaUrl);

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <UserAvatar
        firstName={senderName.split(" ")[0]}
        lastName={senderName.split(" ").slice(1).join(" ")}
        imageUrl={senderImage ?? undefined}
        size={36}
      />
      <div className="flex max-w-[85%] flex-col">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
            {senderName}
          </span>
          <span className="text-[10px] text-gray-400">{formatDateTime(msg.createdAt)}</span>
          {msg.isDeletedGlobally && (
            <span className="rounded bg-error-500/10 px-1.5 py-0.5 text-[10px] text-error-500">
              SİLİNDİ
            </span>
          )}
        </div>

        {msg.replyToMessageId && msg.replyToTextPreview && (
          <div className="mt-1 border-l-2 border-brand-500 bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-400">
            ↪ {msg.replyToTextPreview}
          </div>
        )}

        <div
          className={`mt-1 rounded-2xl px-3 py-2 text-sm ${
            isHidden
              ? "border border-dashed border-error-300 bg-error-50/40 text-gray-700 dark:border-error-500/40 dark:bg-error-500/5"
              : "bg-gray-100 text-gray-800 dark:bg-white/[0.06] dark:text-white/90"
          }`}
        >
          {msg.messageType === 1 && mediaSrc ? (
            <a href={mediaSrc} target="_blank" rel="noreferrer">
              <img
                src={mediaSrc}
                alt="Görsel"
                className="max-h-72 max-w-full rounded-xl object-cover"
              />
            </a>
          ) : msg.messageType === 2 ? (
            <span className="italic text-gray-600 dark:text-gray-400">
              Konum: {msg.text}
            </span>
          ) : msg.messageType === 3 && mediaSrc ? (
            <a
              href={mediaSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-brand-500 underline"
            >
              {msg.text || "Dosyayı indir"}
            </a>
          ) : msg.messageType === 4 && mediaSrc ? (
            <audio src={mediaSrc} controls className="min-w-[240px] max-w-full" />
          ) : (
            <span className="whitespace-pre-wrap break-words">{msg.text || "(boş mesaj)"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
