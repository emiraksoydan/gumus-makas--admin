import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ActionButton from "../../components/common/ActionButton";
import { Modal } from "../../components/ui/modal";
import { DocsIcon } from "../../icons";
import AppIcon from "../../components/icons/AppIcon";
import {
  useGetSavedFiltersQuery,
  type AdminSavedFilter,
} from "../../features/savedFilters/savedFiltersApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

function prettyJson(s?: string | null) {
  if (!s) return "";
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export default function SavedFiltersPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetSavedFiltersQuery();
  const [selected, setSelected] = useState<AdminSavedFilter | null>(null);

  const columns = useMemo<ColumnDef<AdminSavedFilter>[]>(() => [
    {
      id: "name",
      header: "Filtre Adı",
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-800 dark:text-white/90">
          {row.original.name}
        </span>
      ),
    },
    {
      id: "userId",
      header: "Kullanıcı ID",
      accessorKey: "userId",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {row.original.userId ?? "—"}
        </span>
      ),
    },
    {
      id: "schema",
      header: "Şema Sürümü",
      accessorKey: "filterSchemaVersion",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          v{row.original.filterSchemaVersion ?? 1}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Oluşturulma",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {fmtDate(row.original.createdAt)}
        </span>
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
          icon={<DocsIcon className="size-4" />}
          onClick={() => setSelected(row.original)}
        >
          JSON Gör
        </ActionButton>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Kayıtlı Filtreler | Gümüş Makas Admin" description="Saved filter listesi" />
      <PageBreadcrumb pageTitle="Kayıtlı Filtreler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<AdminSavedFilter>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Filtre adı ara..."
        searchKind="SavedFilter"
        emptyMessage="Kayıtlı filtre bulunamadı."
        exportFilename="kayitli-filtreler"
        emptyIcon={<AppIcon name="savedFilter" className="size-12 opacity-40" />}
        onRowClick={(row) => setSelected(row)}
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        className="max-w-3xl p-6 sm:p-8"
      >
        {selected && (
          <>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              {selected.name}
            </h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Şema v{selected.filterSchemaVersion ?? 1} • {fmtDate(selected.createdAt)}
              {selected.userId && (
                <span className="ml-2 font-mono">• Kullanıcı: {selected.userId}</span>
              )}
            </p>
            <pre className="max-h-[60vh] overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-800 dark:bg-white/[0.03] dark:text-gray-200">
              {prettyJson(selected.filterCriteriaJson)}
            </pre>
          </>
        )}
      </Modal>
    </>
  );
}
