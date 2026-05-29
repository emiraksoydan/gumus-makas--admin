import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import UserAvatar from "../../components/common/UserAvatar";
import { useGetManuelBarbersQuery, type ManuelBarber } from "../../features/manuelBarbers/manuelBarbersApi";
import AppIcon from "../../components/icons/AppIcon";
import ManuelBarberDetailDrawer from "../../features/manuelBarbers/ManuelBarberDetailDrawer";
import { formatEntityNumber } from "../../components/common/ParticipantCell";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return "—"; }
}

export default function ManuelBarbersPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetManuelBarbersQuery();
  const [selected, setSelected] = useState<ManuelBarber | null>(null);

  const columns = useMemo<ColumnDef<ManuelBarber>[]>(() => [
    {
      id: "name",
      header: "Berber",
      accessorKey: "fullName",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-3">
            <UserAvatar
              firstName={r.fullName?.split(" ")[0]}
              lastName={r.fullName?.split(" ").slice(1).join(" ")}
              imageUrl={r.imageUrl ?? undefined}
            />
            <span className="font-medium text-gray-800 dark:text-white/90">
              {r.fullName}
            </span>
          </div>
        );
      },
    },
    {
      id: "owner",
      header: "Bağlı Salon",
      accessorFn: (row) => row.storeName ?? row.ownerName ?? "",
      cell: ({ row }) => {
        const r = row.original;
        // Salon bilgisi varsa göster, yoksa owner adıyla yedek
        if (r.storeName) {
          return (
            <div className="flex items-center gap-2.5">
              <UserAvatar
                firstName={r.storeName.split(" ")[0]}
                lastName={r.storeName.split(" ").slice(1).join(" ")}
                imageUrl={r.storeImageUrl ?? undefined}
                size={32}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {r.storeName}
                </span>
                {r.storeNo && (
                  <span className="text-[11px] font-semibold text-brand-500 dark:text-brand-400">
                    {formatEntityNumber(r.storeNo)}
                  </span>
                )}
              </div>
            </div>
          );
        }
        return (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {r.ownerName ?? "—"}
          </span>
        );
      },
    },
    {
      id: "rating",
      header: "Puan",
      accessorKey: "rating",
      cell: ({ row }) => (
        <span className="text-sm">
          ⭐ {(row.original.rating ?? 0).toFixed(1)}
          <span className="ml-1 text-xs text-gray-400">({row.original.reviewCount ?? 0})</span>
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Eklenme",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {fmtDate(row.original.createdAt)}
        </span>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Manuel Berberler | Gümüş Makas Admin" description="Manuel berber listesi" />
      <PageBreadcrumb pageTitle="Manuel Berberler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<ManuelBarber>
        data={data ?? []}
        searchKind="ManuelBarber"
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Berber adı veya sahip ara..."
        emptyMessage="Manuel berber bulunamadı."
        exportFilename="manuel-berberler"
        emptyIcon={<AppIcon name="manuelBarber" className="size-12 opacity-40" />}
        onRowClick={setSelected}
      />

      <ManuelBarberDetailDrawer
        barber={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
