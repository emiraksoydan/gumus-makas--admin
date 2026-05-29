import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ParticipantCell from "../../components/common/ParticipantCell";
import CellWithIcon from "../../components/common/CellWithIcon";
import AppIcon from "../../components/icons/AppIcon";
import {
  useGetServicePackagesQuery,
  serviceOwnerTypeLabels,
  type ServicePackage,
} from "../../features/servicePackages/servicePackagesApi";

export default function ServicePackagesPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetServicePackagesQuery();

  const columns = useMemo<ColumnDef<ServicePackage>[]>(() => [
    {
      id: "owner",
      header: "Sahip",
      accessorFn: (row) =>
        `${row.ownerName ?? ""} ${row.ownerNumber ?? ""} ${
          serviceOwnerTypeLabels[row.ownerType ?? "Unknown"]
        }`.trim(),
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.ownerName}
          imageUrl={row.original.ownerImageUrl}
          typeLabel={serviceOwnerTypeLabels[row.original.ownerType ?? "Unknown"]}
          number={row.original.ownerNumber}
        />
      ),
    },
    {
      id: "name",
      header: "Paket",
      accessorKey: "packageName",
      cell: ({ row }) => (
        <CellWithIcon icon="package">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {row.original.packageName ?? "—"}
          </span>
        </CellWithIcon>
      ),
    },
    {
      id: "services",
      header: "Hizmetler",
      accessorFn: (row) => row.items.map((i) => i.serviceName).join(", "),
      cell: ({ row }) => {
        const names = row.original.items.map((i) => i.serviceName).filter(Boolean);
        return (
          <span className="block max-w-[280px] truncate text-xs text-gray-600 dark:text-gray-300">
            {names.length ? names.join(", ") : "—"}
            <span className="ml-1 text-gray-400">({row.original.itemCount})</span>
          </span>
        );
      },
    },
    {
      id: "price",
      header: "Toplam Fiyat",
      accessorKey: "totalPrice",
      cell: ({ row }) => (
        <CellWithIcon icon="money">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {Number(row.original.totalPrice ?? 0).toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })} ₺
          </span>
        </CellWithIcon>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Paketler | Gümüş Makas Admin" description="Hizmet paketleri listesi" />
      <PageBreadcrumb pageTitle="Paketler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<ServicePackage>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Paket adı ara..."
        emptyMessage="Paket bulunamadı."
        exportFilename="paketler"
        emptyIcon={<AppIcon name="package" className="size-12 opacity-40" />}
      />
    </>
  );
}
