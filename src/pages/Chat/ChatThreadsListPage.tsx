import { useMemo, useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserAvatar from "../../components/common/UserAvatar";
import Badge from "../../components/ui/badge/Badge";
import AppIcon from "../../components/icons/AppIcon";
import BadgeTabs from "../../components/common/BadgeTabs";
import { useGetChatThreadsQuery } from "../../features/chat/chatApi";

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

type ThreadKindFilter = "all" | "appointment" | "favorite";

export default function ChatThreadsListPage() {
  const { data: threads = [], isLoading, error, refetch } = useGetChatThreadsQuery();
  const [filter, setFilter] = useState("");
  const [kindFilter, setKindFilter] = useState<ThreadKindFilter>("all");

  const appointmentCount = useMemo(
    () => threads.filter((t) => !t.isFavoriteThread).length,
    [threads],
  );
  const favoriteCount = useMemo(
    () => threads.filter((t) => t.isFavoriteThread).length,
    [threads],
  );

  const filteredThreads = useMemo(() => {
    let rows = threads;
    if (kindFilter === "appointment") rows = rows.filter((t) => !t.isFavoriteThread);
    if (kindFilter === "favorite") rows = rows.filter((t) => t.isFavoriteThread);
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.lastMessagePreview?.toLowerCase().includes(q) ||
        t.participants.some((p) => p.displayName.toLowerCase().includes(q)),
    );
  }, [threads, filter, kindFilter]);

  return (
    <>
      <PageMeta title="Sohbetler | Gümüş Makas Admin" description="Sohbet thread listesi" />
      <PageBreadcrumb pageTitle="Sohbetler" />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600">
          Sohbetler yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="mb-4 rounded-lg border border-brand-200/60 bg-brand-500/[0.06] px-4 py-3 text-sm text-brand-800 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-200">
        Sohbetler yalnızca okunabilir — kullanıcı mesajlarını denetim amacıyla görüntülersiniz; admin tarafında
        mesaj gönderme veya canlı sohbet bulunmaz.
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <BadgeTabs<ThreadKindFilter>
          tabs={[
            { id: "all", label: "Tümü", badge: threads.length },
            { id: "appointment", label: "Randevu", badge: appointmentCount },
            { id: "favorite", label: "Favori", badge: favoriteCount },
          ]}
          active={kindFilter}
          onChange={setKindFilter}
          className="border-b border-gray-100 dark:border-white/[0.05]"
        />

        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05] sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sohbet listesi
          </h3>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <AppIcon
              name="search"
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Sohbet veya kişi ara..."
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-10 pr-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
            />
          </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {isLoading ? (
            <p className="p-8 text-center text-sm text-gray-500">Yükleniyor...</p>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
              <AppIcon name="inbox" className="size-12 opacity-40" />
              <p className="text-sm">Sohbet bulunamadı.</p>
            </div>
          ) : (
            filteredThreads.map((t) => {
              const first = t.participants[0];
              return (
                <Link
                  key={t.threadId}
                  to={`/chat/${t.threadId}`}
                  className="flex items-start gap-3 px-4 py-4 transition hover:bg-gray-50 dark:hover:bg-white/[0.03] sm:px-6"
                >
                  <UserAvatar
                    firstName={first?.displayName?.split(" ")[0]}
                    lastName={first?.displayName?.split(" ").slice(1).join(" ")}
                    imageUrl={first?.imageUrl ?? undefined}
                    size={48}
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
                  <AppIcon name="chevronRight" className="mt-2 size-5 shrink-0 text-gray-400" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
