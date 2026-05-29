import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import { useGetChairsQuery, type BarberChair } from "../../features/chairs/chairsApi";
import CellWithIcon from "../../components/common/CellWithIcon";
import AppIcon from "../../components/icons/AppIcon";
import ChairDetailDrawer from "../../features/chairs/ChairDetailDrawer";

export default function ChairsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetChairsQuery();
  const [selected, setSelected] = useState<BarberChair | null>(null);

  const columns = useMemo<ColumnDef<BarberChair>[]>(() => [
    {
      id: "name",
      header: "Koltuk Adı",
      accessorKey: "name",
      cell: ({ row }) => (
        <CellWithIcon icon="chair">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {row.original.name ?? "—"}
          </span>
        </CellWithIcon>
      ),
    },
    {
      id: "store",
      header: "Bağlı Salon",
      accessorFn: (row) => row.storeName ?? "",
      cell: ({ row }) => {
        const r = row.original;
        if (!r.storeName) {
          return <span className="text-xs text-gray-400">Bağımsız</span>;
        }
        return (
          <CellWithIcon icon="store">
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-gray-700 dark:text-gray-300">{r.storeName}</span>
              {r.storeNo ? (
                <span className="text-xs text-brand-500/80">{formatEntityNumber(r.storeNo)}</span>
              ) : null}
            </div>
          </CellWithIcon>
        );
      },
    },
    {
      id: "manuelBarber",
      header: "Manuel Berber",
      accessorKey: "manuelBarberName",
      cell: ({ row }) => (
        <CellWithIcon icon="manuelBarber">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.manuelBarberName ?? "—"}
          </span>
        </CellWithIcon>
      ),
    },
    {
      id: "status",
      header: "Durum",
      accessorKey: "isAvailable",
      cell: ({ row }) =>
        row.original.isAvailable ? (
          <Badge size="sm" color="success">Müsait</Badge>
        ) : (
          <Badge size="sm" color="warning">Dolu</Badge>
        ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Koltuklar | Gümüş Makas Admin" description="Koltuk listesi" />
      <PageBreadcrumb pageTitle="Koltuklar" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<BarberChair>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Koltuk veya salon ara..."
        searchKind="Chair"
        emptyMessage="Koltuk bulunamadı."
        exportFilename="koltuklar"
        emptyIcon={<AppIcon name="chair" className="size-12 opacity-40" />}
        onRowClick={setSelected}
      />

      <ChairDetailDrawer
        chair={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
