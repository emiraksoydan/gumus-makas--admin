import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import {
  useGetComplaintsQuery,
  type AdminComplaint,
} from "../../features/complaints/complaintsApi";
import AppIcon from "../../components/icons/AppIcon";
import ComplaintDetailDrawer from "../../features/complaints/ComplaintDetailDrawer";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function ComplaintsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetComplaintsQuery();
  const [selected, setSelected] = useState<AdminComplaint | null>(null);

  const columns = useMemo<ColumnDef<AdminComplaint>[]>(() => [
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
      header: "Şikayet Eden",
      accessorFn: (row) => row.complaintFromUserName ?? row.complaintFromUserId,
      cell: ({ row }) => (
        <ParticipantCell
          name={row.original.complaintFromUserName}
          imageUrl={row.original.complaintFromUserImage}
          userType={row.original.complaintFromUserType}
          number={row.original.complaintFromCustomerNumber}
        />
      ),
    },
    {
      id: "target",
      header: "Şikayet Edilen",
      accessorFn: (row) => row.targetUserName ?? row.complaintToUserId,
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
      header: "Şikayet",
      accessorKey: "complaintReason",
      cell: ({ row }) => (
        <span className="block max-w-[400px] whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {row.original.complaintReason}
        </span>
      ),
    },
    {
      id: "appointment",
      header: "Randevu",
      accessorKey: "appointmentId",
      cell: ({ row }) =>
        row.original.appointmentId ? (
          <Badge size="sm" color="info">Randevuya bağlı</Badge>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      id: "status",
      header: "Durum",
      accessorKey: "isResolved",
      cell: ({ row }) =>
        row.original.isResolved ? (
          <Badge size="sm" color="success">Çözümlendi</Badge>
        ) : (
          <Badge size="sm" color="warning">Açık</Badge>
        ),
    },
  ], []);

  return (
    <>
      <PageMeta title="Şikayetler | Gümüş Makas Admin" description="Şikayet listesi" />
      <PageBreadcrumb pageTitle="Şikayetler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<AdminComplaint>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Hedef kullanıcı, içerik ara..."
        searchKind="Complaint"
        emptyMessage="Şikayet bulunamadı."
        exportFilename="sikayetler"
        emptyIcon={<AppIcon name="complaint" className="size-12 opacity-40" />}
        onRowClick={setSelected}
      />

      <ComplaintDetailDrawer
        complaint={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
