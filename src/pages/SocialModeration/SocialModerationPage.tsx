import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import BadgeTabs from "../../components/common/BadgeTabs";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import AppIcon from "../../components/icons/AppIcon";
import ParticipantCell from "../../components/common/ParticipantCell";
import SocialModerationDetailDrawer, {
  type SocialModerationTab,
} from "../../features/socialModeration/SocialModerationDetailDrawer";
import {
  SocialContentStatus,
  socialContentStatusLabels,
  socialOwnerTypeLabels,
  socialPostTypeLabels,
  useGetSocialHighlightsAdminQuery,
  useGetSocialPostsAdminQuery,
  useGetSocialProfilesAdminQuery,
  useGetSocialStoriesAdminQuery,
  type SocialPostAdmin,
  type SocialProfileAdmin,
  type SocialStoryAdmin,
  type SocialStoryHighlightAdmin,
} from "../../features/socialModeration/socialModerationApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

function StatusCell({ status }: { status: SocialContentStatus }) {
  const tone =
    status === SocialContentStatus.Active
      ? "success"
      : status === SocialContentStatus.Removed
        ? "error"
        : "warning";
  return <Badge color={tone}>{socialContentStatusLabels[status]}</Badge>;
}

const TABS: { id: SocialModerationTab; label: string }[] = [
  { id: "posts", label: "Gönderiler" },
  { id: "stories", label: "Hikayeler" },
  { id: "profiles", label: "Profiller" },
  { id: "highlights", label: "Öne Çıkanlar" },
];

export default function SocialModerationPage() {
  const [tab, setTab] = useState<SocialModerationTab>("posts");
  const [draftSearch, setDraftSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SocialContentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<SocialPostAdmin | null>(null);
  const [selectedStory, setSelectedStory] = useState<SocialStoryAdmin | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<SocialProfileAdmin | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<SocialStoryHighlightAdmin | null>(null);

  const listParams = {
    search: appliedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    pageSize,
  };

  const postsQuery = useGetSocialPostsAdminQuery(listParams, { skip: tab !== "posts" });
  const storiesQuery = useGetSocialStoriesAdminQuery(listParams, { skip: tab !== "stories" });
  const profilesQuery = useGetSocialProfilesAdminQuery(listParams, { skip: tab !== "profiles" });
  const highlightsQuery = useGetSocialHighlightsAdminQuery(listParams, { skip: tab !== "highlights" });

  const activeQuery =
    tab === "posts"
      ? postsQuery
      : tab === "stories"
        ? storiesQuery
        : tab === "highlights"
          ? highlightsQuery
          : profilesQuery;

  const hasNextPage = (activeQuery.data?.length ?? 0) >= pageSize;

  const applyFilters = () => {
    setAppliedSearch(draftSearch);
    setPage(1);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setAppliedSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const postColumns = useMemo<ColumnDef<SocialPostAdmin>[]>(() => [
    {
      id: "createdAt",
      header: "Tarih",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "profile",
      header: "Profil",
      accessorKey: "profileUsername",
      cell: ({ row }) => (
        <ParticipantCell
          name={`@${row.original.profileUsername}`}
          imageUrl={row.original.thumbnailUrl}
          typeLabel={socialOwnerTypeLabels[row.original.ownerType]}
        />
      ),
    },
    {
      id: "type",
      header: "Tür",
      accessorKey: "type",
      cell: ({ row }) => socialPostTypeLabels[row.original.type],
    },
    {
      id: "caption",
      header: "Açıklama",
      accessorKey: "caption",
      cell: ({ row }) => (
        <span className="block max-w-[280px] truncate text-sm text-gray-700 dark:text-gray-300">
          {row.original.caption ?? "—"}
        </span>
      ),
    },
    {
      id: "stats",
      header: "Etkileşim",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.original.likeCount} beğeni · {row.original.commentCount} yorum · {row.original.viewCount} görüntülenme
        </span>
      ),
    },
    {
      id: "status",
      header: "Durum",
      accessorKey: "status",
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
  ], []);

  const storyColumns = useMemo<ColumnDef<SocialStoryAdmin>[]>(() => [
    {
      id: "createdAt",
      header: "Tarih",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "profile",
      header: "Profil",
      accessorKey: "profileUsername",
      cell: ({ row }) => (
        <ParticipantCell
          name={`@${row.original.profileUsername}`}
          imageUrl={row.original.thumbnailUrl ?? row.original.mediaUrl}
          typeLabel={socialOwnerTypeLabels[row.original.ownerType]}
        />
      ),
    },
    {
      id: "expiresAt",
      header: "Bitiş",
      accessorKey: "expiresAt",
      cell: ({ row }) => fmtDate(row.original.expiresAt),
    },
    {
      id: "duration",
      header: "Süre",
      accessorKey: "durationSec",
      cell: ({ row }) => (row.original.durationSec != null ? `${row.original.durationSec} sn` : "—"),
    },
    {
      id: "status",
      header: "Durum",
      accessorKey: "status",
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
  ], []);

  const profileColumns = useMemo<ColumnDef<SocialProfileAdmin>[]>(() => [
    {
      id: "createdAt",
      header: "Tarih",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "profile",
      header: "Sosyal profil",
      accessorKey: "username",
      cell: ({ row }) => (
        <ParticipantCell
          name={`@${row.original.username}`}
          imageUrl={row.original.avatarUrl}
          typeLabel={socialOwnerTypeLabels[row.original.ownerType]}
          number={row.original.ownerNumber}
        />
      ),
    },
    {
      id: "owner",
      header: "Sahip",
      accessorKey: "ownerDisplayName",
      cell: ({ row }) => row.original.ownerDisplayName ?? "—",
    },
    {
      id: "stats",
      header: "İstatistik",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {row.original.postCount} gönderi · {row.original.followerCount} takipçi
        </span>
      ),
    },
    {
      id: "status",
      header: "Durum",
      accessorKey: "status",
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
  ], []);

  const highlightColumns = useMemo<ColumnDef<SocialStoryHighlightAdmin>[]>(() => [
    {
      id: "createdAt",
      header: "Tarih",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "profile",
      header: "Profil",
      accessorKey: "profileUsername",
      cell: ({ row }) => (
        <ParticipantCell
          name={`@${row.original.profileUsername}`}
          imageUrl={row.original.coverUrl}
          typeLabel={socialOwnerTypeLabels[row.original.ownerType]}
        />
      ),
    },
    {
      id: "title",
      header: "Başlık",
      accessorKey: "title",
      cell: ({ row }) => (
        <span className="block max-w-[200px] truncate text-sm text-gray-700 dark:text-gray-300">
          {row.original.title}
        </span>
      ),
    },
    {
      id: "items",
      header: "Hikaye",
      accessorKey: "itemCount",
      cell: ({ row }) => `${row.original.itemCount} hikaye`,
    },
    {
      id: "sortOrder",
      header: "Sıra",
      accessorKey: "sortOrder",
    },
    {
      id: "status",
      header: "Durum",
      accessorKey: "status",
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
  ], []);

  const drawerSelection =
    selectedPost
      ? { tab: "posts" as const, item: selectedPost }
      : selectedStory
        ? { tab: "stories" as const, item: selectedStory }
        : selectedHighlight
          ? { tab: "highlights" as const, item: selectedHighlight }
          : selectedProfile
            ? { tab: "profiles" as const, item: selectedProfile }
            : null;

  const closeDrawer = () => {
    setSelectedPost(null);
    setSelectedStory(null);
    setSelectedProfile(null);
    setSelectedHighlight(null);
  };

  return (
    <>
      <PageMeta title="Sosyal Moderasyon | Gümüş Makas Admin" description="Sosyal medya içerik moderasyonu" />
      <PageBreadcrumb pageTitle="Sosyal Moderasyon" />

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <BadgeTabs
          tabs={TABS}
          active={tab}
          onChange={(id) => {
            setTab(id);
            setPage(1);
            closeDrawer();
          }}
        />

        <div className="flex flex-wrap items-end gap-3 border-t border-gray-100 px-4 py-4 dark:border-white/[0.05] sm:px-6">
          <div className="min-w-[200px] flex-1">
            <Label>Ara</Label>
            <Input
              placeholder="Kullanıcı adı, açıklama..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>
          <div>
            <Label>Durum</Label>
            <select
              className="h-11 w-full min-w-[140px] rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
              value={statusFilter === "all" ? "all" : String(statusFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setStatusFilter(v === "all" ? "all" : (Number(v) as SocialContentStatus));
                setPage(1);
              }}
            >
              <option value="all">Tümü</option>
              <option value={SocialContentStatus.Active}>Aktif</option>
              <option value={SocialContentStatus.Hidden}>Gizli</option>
              <option value={SocialContentStatus.Removed}>Kaldırıldı</option>
            </select>
          </div>
          <Button size="sm" onClick={applyFilters}>Filtrele</Button>
          <Button size="sm" variant="outline" onClick={clearFilters}>Temizle</Button>
        </div>
      </div>

      {activeQuery.error && !activeQuery.data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => activeQuery.refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      {tab === "posts" && (
        <DataTable<SocialPostAdmin>
          data={postsQuery.data ?? []}
          columns={postColumns}
          isLoading={postsQuery.isLoading || postsQuery.isFetching}
          searchPlaceholder="Tabloda ara..."
          emptyMessage="Gönderi bulunamadı."
          exportFilename="sosyal-gonderiler"
          emptyIcon={<AppIcon name="image" className="size-12 opacity-40" />}
          onRowClick={setSelectedPost}
        />
      )}

      {tab === "stories" && (
        <DataTable<SocialStoryAdmin>
          data={storiesQuery.data ?? []}
          columns={storyColumns}
          isLoading={storiesQuery.isLoading || storiesQuery.isFetching}
          searchPlaceholder="Tabloda ara..."
          emptyMessage="Hikaye bulunamadı."
          exportFilename="sosyal-hikayeler"
          emptyIcon={<AppIcon name="video" className="size-12 opacity-40" />}
          onRowClick={setSelectedStory}
        />
      )}

      {tab === "profiles" && (
        <DataTable<SocialProfileAdmin>
          data={profilesQuery.data ?? []}
          columns={profileColumns}
          isLoading={profilesQuery.isLoading || profilesQuery.isFetching}
          searchPlaceholder="Tabloda ara..."
          emptyMessage="Profil bulunamadı."
          exportFilename="sosyal-profiller"
          emptyIcon={<AppIcon name="users" className="size-12 opacity-40" />}
          onRowClick={setSelectedProfile}
        />
      )}

      {tab === "highlights" && (
        <DataTable<SocialStoryHighlightAdmin>
          data={highlightsQuery.data ?? []}
          columns={highlightColumns}
          isLoading={highlightsQuery.isLoading || highlightsQuery.isFetching}
          searchPlaceholder="Tabloda ara..."
          emptyMessage="Öne çıkan bulunamadı."
          exportFilename="sosyal-one-cikanlar"
          emptyIcon={<AppIcon name="rating" className="size-12 opacity-40" />}
          onRowClick={setSelectedHighlight}
        />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Sayfa {page}</span>
          <select
            className="rounded-lg border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n} / sayfa</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || activeQuery.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Önceki
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!hasNextPage || activeQuery.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      </div>

      <SocialModerationDetailDrawer
        selection={drawerSelection}
        isOpen={!!drawerSelection}
        onClose={closeDrawer}
      />
    </>
  );
}
