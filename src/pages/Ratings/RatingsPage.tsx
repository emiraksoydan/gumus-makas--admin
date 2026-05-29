import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ParticipantCell from "../../components/common/ParticipantCell";
import { useGetRatingsQuery, type AdminRating } from "../../features/ratings/ratingsApi";
import AppIcon from "../../components/icons/AppIcon";
import RatingDetailDrawer from "../../features/ratings/RatingDetailDrawer";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

function Stars({ score }: { score: number }) {
  const full = Math.floor(score);
  return (
    <span className="text-warning-500">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
        {score.toFixed(1)}
      </span>
    </span>
  );
}

export default function RatingsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetRatingsQuery();
  const [selected, setSelected] = useState<AdminRating | null>(null);

  const columns = useMemo<ColumnDef<AdminRating>[]>(() => [
    {
      id: "createdAt",
      header: "Tarih",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {fmtDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "from",
      header: "Değerlendiren",
      accessorFn: (row) => row.ratedFromName ?? row.ratedFromId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.ratedFromName}
          imageUrl={row.original.ratedFromImage}
          userType={row.original.ratedFromUserType}
        />
      ),
    },
    {
      id: "target",
      header: "Değerlendirilen",
      accessorFn: (row) => row.targetName ?? row.targetId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.targetName}
          imageUrl={row.original.targetImage}
          typeLabel={row.original.targetTypeLabel}
          number={row.original.targetNumber}
        />
      ),
    },
    {
      id: "score",
      header: "Puan",
      accessorKey: "score",
      cell: ({ row }) => <Stars score={row.original.score} />,
    },
    {
      id: "comment",
      header: "Yorum",
      accessorKey: "comment",
      cell: ({ row }) => (
        <span className="block max-w-[400px] whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {row.original.comment ?? "—"}
        </span>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Değerlendirmeler | Gümüş Makas Admin" description="Rating listesi" />
      <PageBreadcrumb pageTitle="Değerlendirmeler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<AdminRating>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Değerlendiren, yorum ara..."
        searchKind="Rating"
        emptyMessage="Değerlendirme bulunamadı."
        exportFilename="degerlendirmeler"
        emptyIcon={<AppIcon name="rating" className="size-12 opacity-40" />}
        onRowClick={setSelected}
      />

      <RatingDetailDrawer
        rating={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
