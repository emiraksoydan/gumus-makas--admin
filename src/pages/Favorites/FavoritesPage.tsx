import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import {
  favoriteTargetTypeLabels,
  useGetFavoritesQuery,
  type AdminFavorite,
} from "../../features/favorites/favoritesApi";
import AppIcon from "../../components/icons/AppIcon";
import FavoriteDetailDrawer from "../../features/favorites/FavoriteDetailDrawer";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return "—"; }
}

export default function FavoritesPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetFavoritesQuery();
  const [selected, setSelected] = useState<AdminFavorite | null>(null);

  const columns = useMemo<ColumnDef<AdminFavorite>[]>(() => [
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
      header: "Favorileyen",
      accessorFn: (row) => row.favoritedFromName ?? row.favoritedFromId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.favoritedFromName}
          imageUrl={row.original.favoritedFromImage}
          userType={row.original.favoritedFromUserType}
          number={row.original.favoritedFromCustomerNumber}
        />
      ),
    },
    {
      id: "target",
      header: "Favori Hedefi",
      accessorFn: (row) => row.targetName ?? row.favoritedToId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.targetName}
          imageUrl={row.original.targetImage}
          typeLabel={favoriteTargetTypeLabels[row.original.targetType]}
          number={row.original.targetNumber}
        />
      ),
    },
    {
      id: "type",
      header: "Tür",
      accessorFn: (row) => favoriteTargetTypeLabels[row.targetType] ?? String(row.targetType),
      cell: ({ row }) => (
        <Badge size="sm" color="info">
          {favoriteTargetTypeLabels[row.original.targetType] ?? String(row.original.targetType)}
        </Badge>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Favoriler | Gümüş Makas Admin" description="Favori listesi" />
      <PageBreadcrumb pageTitle="Favoriler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<AdminFavorite>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Favori hedefi ara..."
        searchKind="Favorite"
        emptyMessage="Favori kaydı bulunamadı."
        exportFilename="favoriler"
        emptyIcon={<AppIcon name="favorite" className="size-12 opacity-40" />}
        onRowClick={setSelected}
      />

      <FavoriteDetailDrawer
        favorite={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
