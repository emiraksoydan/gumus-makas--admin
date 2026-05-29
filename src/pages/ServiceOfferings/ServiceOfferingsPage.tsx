import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import {
  useGetServiceOfferingsQuery,
  serviceOwnerTypeLabels,
  type ServiceOffering,
} from "../../features/serviceOfferings/serviceOfferingsApi";
import ServiceDetailDrawer from "../../features/serviceOfferings/ServiceDetailDrawer";
import CellWithIcon from "../../components/common/CellWithIcon";
import ParticipantCell from "../../components/common/ParticipantCell";
import AppIcon from "../../components/icons/AppIcon";

export default function ServiceOfferingsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetServiceOfferingsQuery();
  const [selected, setSelected] = useState<ServiceOffering | null>(null);

  const columns = useMemo<ColumnDef<ServiceOffering>[]>(() => [
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
      header: "Hizmet",
      accessorFn: (row) => row.name ?? row.serviceName ?? "",
      cell: ({ row }) => (
        <CellWithIcon icon="service">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {row.original.name ?? row.original.serviceName ?? "—"}
          </span>
        </CellWithIcon>
      ),
    },
    {
      id: "price",
      header: "Fiyat",
      accessorKey: "price",
      cell: ({ row }) => (
        <CellWithIcon icon="money">
          <span className="font-medium text-gray-800 dark:text-white/90">
            {Number(row.original.price ?? 0).toLocaleString("tr-TR", {
              minimumFractionDigits: 2,
            })} ₺
          </span>
        </CellWithIcon>
      ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Hizmetler | Gümüş Makas Admin" description="Hizmet listesi" />
      <PageBreadcrumb pageTitle="Hizmetler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<ServiceOffering>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Hizmet adı ara..."
        searchKind="Service"
        emptyMessage="Hizmet bulunamadı."
        exportFilename="hizmetler"
        emptyIcon={<AppIcon name="service" className="size-12 opacity-40" />}
        onRowClick={(row) => setSelected(row)}
      />

      <ServiceDetailDrawer
        service={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
