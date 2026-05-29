import { useMemo, useState } from "react";
import TableFilterDropdown, {
  type TableFilterField,
  type TableFilterValues,
} from "../../components/common/TableFilterDropdown";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import { useGetRequestsQuery, type AdminRequest } from "../../features/requests/requestsApi";
import AppIcon from "../../components/icons/AppIcon";
import RequestDetailDrawer from "../../features/requests/RequestDetailDrawer";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

const REQUEST_FILTER_FIELDS: TableFilterField[] = [
  {
    type: "toggle",
    key: "status",
    label: "Durum",
    options: [
      { value: "all", label: "Tümü" },
      { value: "open", label: "Açık" },
      { value: "processed", label: "İşlendi" },
    ],
  },
];

export default function RequestsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetRequestsQuery();
  const [selected, setSelected] = useState<AdminRequest | null>(null);
  const [filterValues, setFilterValues] = useState<TableFilterValues>({ status: "all" });

  const filteredData = useMemo(() => {
    const rows = data ?? [];
    const s = filterValues.status;
    if (s === "open") return rows.filter((r) => !r.isProcessed);
    if (s === "processed") return rows.filter((r) => r.isProcessed);
    return rows;
  }, [data, filterValues.status]);

  const columns = useMemo<ColumnDef<AdminRequest>[]>(() => [
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
      id: "title",
      header: "Başlık",
      accessorKey: "requestTitle",
      cell: ({ row }) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {row.original.requestTitle}
        </span>
      ),
    },
    {
      id: "message",
      header: "Mesaj",
      accessorKey: "requestMessage",
      cell: ({ row }) => (
        <span className="block max-w-[400px] truncate text-sm text-gray-700 dark:text-gray-300">
          {row.original.requestMessage}
        </span>
      ),
    },
    {
      id: "from",
      header: "Talep Eden",
      accessorFn: (row) => row.requestFromUserName ?? row.requestFromUserId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.requestFromUserName}
          userType={row.original.requestFromUserType}
          number={row.original.requestFromCustomerNumber}
        />
      ),
    },
    {
      id: "status",
      header: "Durum",
      accessorFn: (row) => (row.isProcessed ? "İşlendi" : "Açık"),
      cell: ({ row }) =>
        row.original.isProcessed ? (
          <Badge size="sm" color="success" variant="solid">İşlendi</Badge>
        ) : (
          <Badge size="sm" color="warning" variant="solid">Açık</Badge>
        ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Talepler | Gümüş Makas Admin" description="İstek listesi" />
      <PageBreadcrumb pageTitle="Talepler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<AdminRequest>
        data={filteredData}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Başlık veya mesaj ara..."
        searchKind="Request"
        emptyMessage="Talep bulunamadı."
        exportFilename="talepler"
        emptyIcon={<AppIcon name="request" className="size-12 opacity-40" />}
        onRowClick={setSelected}
        filterControl={
          <TableFilterDropdown
            fields={REQUEST_FILTER_FIELDS}
            values={filterValues}
            onChange={setFilterValues}
          />
        }
      />

      <RequestDetailDrawer
        request={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
