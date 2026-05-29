import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import TableFilterDropdown, {
  type TableFilterField,
  type TableFilterValues,
} from "../../components/common/TableFilterDropdown";
import UserAvatar from "../../components/common/UserAvatar";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import {
  AppointmentFilter,
  appointmentStatusBadgeColor,
  appointmentStatusLabels,
  useGetAppointmentsQuery,
  type AdminAppointment,
} from "../../features/appointments/appointmentsApi";
import CellWithIcon from "../../components/common/CellWithIcon";
import AppIcon from "../../components/icons/AppIcon";
import AppointmentDetailDrawer from "../../features/appointments/AppointmentDetailDrawer";


function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
function fmtTime(iso?: string | null) {
  if (!iso) return "";
  // backend "HH:mm:ss" yada full ISO dönebilir; ilk 5 char alalım
  if (/^\d{2}:\d{2}/.test(iso)) return iso.slice(0, 5);
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const APPOINTMENT_FILTER_FIELDS: TableFilterField[] = [
  {
    type: "toggle",
    key: "status",
    label: "Randevu durumu",
    options: [
      { value: String(AppointmentFilter.All), label: "Tümü" },
      { value: String(AppointmentFilter.Pending), label: "Beklemede" },
      { value: String(AppointmentFilter.Approved), label: "Onaylı" },
      { value: String(AppointmentFilter.Completed), label: "Tamamlandı" },
      { value: String(AppointmentFilter.Cancelled), label: "İptal" },
    ],
  },
];

export default function AppointmentsPage() {
  const [filterValues, setFilterValues] = useState<TableFilterValues>({
    status: String(AppointmentFilter.All),
  });
  const filter = Number(filterValues.status ?? AppointmentFilter.All) as AppointmentFilter;
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const { data, isLoading, isFetching, error, refetch } = useGetAppointmentsQuery(filter);

  const columns = useMemo<ColumnDef<AdminAppointment>[]>(
    () => [
      {
        id: "datetime",
        header: "Tarih / Saat",
        accessorFn: (row) => `${row.appointmentDate ?? ""} ${row.startTime ?? ""}`,
        cell: ({ row }) => (
          <CellWithIcon icon="calendar">
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-gray-800 dark:text-white/90">
                {fmtDate(row.original.appointmentDate)}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <AppIcon name="time" className="size-3 shrink-0 opacity-70" />
                {fmtTime(row.original.startTime)}
                {row.original.endTime && ` – ${fmtTime(row.original.endTime)}`}
              </span>
            </div>
          </CellWithIcon>
        ),
      },
      {
        id: "customer",
        header: "Müşteri",
        accessorFn: (row) => row.customerName ?? "",
        cell: ({ row }) => {
          const r = row.original;
          if (!r.customerName) return <span className="text-xs text-gray-400">—</span>;
          return (
            <div className="flex items-center gap-2">
              <UserAvatar
                firstName={r.customerName.split(" ")[0]}
                lastName={r.customerName.split(" ").slice(1).join(" ")}
                imageUrl={r.customerImage ?? undefined}
                size={32}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {r.customerName}
                </span>
                {r.customerNumber && (
                  <span className="text-xs text-gray-400">#{r.customerNumber}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "provider",
        header: "Hizmet Veren",
        accessorFn: (row) =>
          row.storeName ?? row.freeBarberName ?? row.manuelBarberName ?? "",
        cell: ({ row }) => {
          const r = row.original;
          const name = r.storeName ?? r.freeBarberName ?? r.manuelBarberName;
          const image = r.storeImage ?? r.freeBarberImage ?? r.manuelBarberImage;
          const kind = r.storeName ? "Salon" : r.freeBarberName ? "Serbest Berber" : r.manuelBarberName ? "Manuel" : null;
          const number = r.storeName
            ? r.storeNo
            : r.freeBarberName
              ? r.freeBarberNumber
              : null;
          if (!name) return <span className="text-xs text-gray-400">—</span>;
          return (
            <div className="flex items-center gap-2">
              <UserAvatar
                firstName={name.split(" ")[0]}
                lastName={name.split(" ").slice(1).join(" ")}
                imageUrl={image ?? undefined}
                size={32}
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm text-gray-800 dark:text-white/90">{name}</span>
                <div className="flex flex-wrap items-center gap-x-2">
                  {kind && (
                    <span className="text-[10px] uppercase text-gray-400">{kind}</span>
                  )}
                  {number ? (
                    <span className="text-xs font-medium text-brand-500/80">
                      {formatEntityNumber(number)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "chair",
        header: "Koltuk",
        accessorFn: (row) => row.chairName ?? "—",
        cell: ({ row }) =>
          row.original.chairName ? (
            <CellWithIcon icon="chair">
              <span className="text-sm text-gray-800 dark:text-white/90">
                {row.original.chairName}
              </span>
            </CellWithIcon>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        id: "price",
        header: "Tutar",
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
      {
        id: "status",
        header: "Durum",
        accessorFn: (row) => appointmentStatusLabels[row.status],
        cell: ({ row }) => (
          <Badge
            size="sm"
            variant="solid"
            color={appointmentStatusBadgeColor[row.original.status] ?? "info"}
          >
            {appointmentStatusLabels[row.original.status] ??
              String(row.original.status)}
          </Badge>
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
    ],
    [],
  );

  return (
    <>
      <PageMeta title="Randevular | Gümüş Makas Admin" description="Randevu yönetimi" />
      <div className="mb-4">
        <PageBreadcrumb pageTitle="Randevular" />
      </div>

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Randevular yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <DataTable<AdminAppointment>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Müşteri, salon, berber ara..."
        searchKind="Appointment"
        emptyMessage="Randevu bulunamadı."
        exportFilename="randevular"
        emptyIcon={<AppIcon name="calendar" className="size-12 opacity-40" />}
        onRowClick={setSelected}
        filterControl={
          <TableFilterDropdown
            fields={APPOINTMENT_FILTER_FIELDS}
            values={filterValues}
            onChange={setFilterValues}
          />
        }
      />

      <AppointmentDetailDrawer
        appointment={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
