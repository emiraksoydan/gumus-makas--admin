import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ParticipantCell from "../../components/common/ParticipantCell";
import { useGetBlockedQuery, type AdminBlocked } from "../../features/blocked/blockedApi";
import AppIcon from "../../components/icons/AppIcon";
import BlockedDetailDrawer from "../../features/blocked/BlockedDetailDrawer";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function BlockedPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetBlockedQuery();
  const [selected, setSelected] = useState<AdminBlocked | null>(null);

  const columns = useMemo<ColumnDef<AdminBlocked>[]>(() => [
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
      header: "Engelleyen",
      accessorFn: (row) => row.blockedFromUserName ?? row.blockedFromUserId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.blockedFromUserName}
          imageUrl={row.original.blockedFromUserImage}
          userType={row.original.blockedFromUserType}
          number={row.original.blockedFromCustomerNumber}
        />
      ),
    },
    {
      id: "target",
      header: "Engellenen",
      accessorFn: (row) => row.targetUserName ?? row.blockedToUserId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.targetUserName}
          imageUrl={row.original.targetUserImage}
          userType={row.original.targetUserType}
          number={row.original.targetCustomerNumber}
        />
      ),
    },
    {
      id: "reason",
      header: "Sebep",
      accessorKey: "blockReason",
      cell: ({ row }) => (
        <span className="block max-w-[400px] whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {row.original.blockReason || "—"}
        </span>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Engellenenler | Gümüş Makas Admin" description="Kullanıcı engelleri" />
      <PageBreadcrumb pageTitle="Engellenenler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<AdminBlocked>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Engellenen kullanıcı veya sebep ara..."
        searchKind="Blocked"
        emptyMessage="Engelleme kaydı bulunamadı."
        exportFilename="engellenenler"
        emptyIcon={<AppIcon name="blocked" className="size-12 opacity-40" />}
        onRowClick={setSelected}
      />

      <BlockedDetailDrawer
        item={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
