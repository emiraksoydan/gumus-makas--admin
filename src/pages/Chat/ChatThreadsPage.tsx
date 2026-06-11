import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import UserAvatar from "../../components/common/UserAvatar";
import ActionButton from "../../components/common/ActionButton";
import Badge from "../../components/ui/badge/Badge";
import AppIcon from "../../components/icons/AppIcon";
import { useGetChatThreadsQuery, type ChatThread } from "../../features/chat/chatApi";
import ThreadMessagesDrawer from "../../features/chat/ThreadMessagesDrawer";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function ChatThreadsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetChatThreadsQuery();
  const [selected, setSelected] = useState<ChatThread | null>(null);

  const columns = useMemo<ColumnDef<ChatThread>[]>(
    () => [
      {
        id: "title",
        header: "Başlık",
        accessorKey: "title",
        cell: ({ row }) => {
          const t = row.original;
          const first = t.participants?.[0];
          return (
            <div className="flex items-center gap-3">
              <UserAvatar
                firstName={first?.displayName?.split(" ")[0] ?? (t.title?.split(" ")[0])}
                lastName={first?.displayName?.split(" ").slice(1).join(" ")}
                imageUrl={first?.imageUrl ?? undefined}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {t.title || "—"}
                </span>
                {(t.participants?.length ?? 0) > 1 ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{t.participants.length - 1} katılımcı
                  </span>
                ) : (t.participants?.length ?? 0) === 0 ? (
                  <span className="text-xs text-gray-400">Katılımcı bilgisi yok</span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: "type",
        header: "Tür",
        accessorFn: (row) => (row.isFavoriteThread ? "Favori" : "Randevu"),
        cell: ({ row }) =>
          row.original.isFavoriteThread ? (
            <Badge size="sm" color="info">Favori</Badge>
          ) : (
            <Badge size="sm" color="primary">Randevu</Badge>
          ),
      },
      {
        id: "lastMessage",
        header: "Son Mesaj",
        accessorFn: (row) => row.lastMessagePreview ?? "",
        cell: ({ row }) =>
          row.original.lastMessagePreview ? (
            <span className="block max-w-[280px] truncate text-gray-600 dark:text-gray-400">
              {row.original.lastMessagePreview}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Henüz mesaj yok</span>
          ),
      },
      {
        id: "lastMessageAt",
        header: "Son Aktivite",
        accessorKey: "lastMessageAt",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(row.original.lastMessageAt)}
          </span>
        ),
      },
      {
        id: "unread",
        header: "Okunmamış",
        accessorKey: "unreadCount",
        cell: ({ row }) =>
          row.original.unreadCount > 0 ? (
            <Badge size="sm" color="warning">{row.original.unreadCount}</Badge>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        id: "actions",
        header: "İşlem",
        enableSorting: false,
        cell: ({ row }) => (
          <ActionButton
            tone="info"
            variant="soft"
            icon={<AppIcon name="chat" className="size-4" />}
            onClick={() => setSelected(row.original)}
          >
            Mesajları Gör
          </ActionButton>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageMeta title="Sohbetler | Gümüş Makas Admin" description="Chat thread admin görünümü" />
      <PageBreadcrumb pageTitle="Sohbetler" />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Sohbetler yüklenemedi.
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <DataTable<ChatThread>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Başlık, katılımcı, mesaj içeriği ara..."
        searchKind="ChatThread"
        getRowId={(row) => row.threadId}
        exportFilename="sohbet-konulari"
        emptyMessage="Sohbet bulunamadı."
        emptyIcon={<AppIcon name="chat" className="size-12 opacity-40" />}
        onRowClick={(row) => setSelected(row)}
      />

      <ThreadMessagesDrawer
        thread={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
