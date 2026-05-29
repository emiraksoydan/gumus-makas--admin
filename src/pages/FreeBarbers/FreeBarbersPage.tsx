import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import Badge from "../../components/ui/badge/Badge";
import EntityThumbnail from "../../components/common/EntityThumbnail";
import {
  useGetFreeBarbersQuery,
  useSuspendFreeBarberMutation,
  type FreeBarberAdmin,
} from "../../features/freeBarbers/freeBarbersApi";
import FreeBarberDetailDrawer from "../../features/freeBarbers/FreeBarberDetailDrawer";
import SuspendModal from "../../components/common/SuspendModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import CellWithIcon from "../../components/common/CellWithIcon";
import AppIcon from "../../components/icons/AppIcon";
import ActionButton from "../../components/common/ActionButton";
import { useToast } from "../../context/ToastContext";
import { notifyApiError } from "../../utils/notifyMutation";

export default function FreeBarbersPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetFreeBarbersQuery();
  const [suspendBarber, { isLoading: isSuspending }] = useSuspendFreeBarberMutation();
  const toast = useToast();

  const [selected, setSelected] = useState<FreeBarberAdmin | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<FreeBarberAdmin | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<FreeBarberAdmin | null>(null);

  const handleSuspendConfirm = useCallback(async (reason: string) => {
    if (!suspendTarget) return;
    try {
      await suspendBarber({ id: suspendTarget.id, suspend: true, reason: reason || undefined }).unwrap();
      setSuspendTarget(null);
      toast.success("Serbest berber askıya alındı.");
    } catch (err) {
      notifyApiError(toast, err, "Askıya alma başarısız oldu.");
    }
  }, [suspendTarget, suspendBarber, toast]);

  const handleUnsuspendConfirm = useCallback(async () => {
    if (!unsuspendTarget) return;
    try {
      await suspendBarber({ id: unsuspendTarget.id, suspend: false }).unwrap();
      setUnsuspendTarget(null);
      toast.success("Serbest berber askısı kaldırıldı.");
    } catch (err) {
      notifyApiError(toast, err, "Askı kaldırma başarısız oldu.");
    }
  }, [unsuspendTarget, suspendBarber, toast]);

  const columns = useMemo<ColumnDef<FreeBarberAdmin>[]>(
    () => [
      {
        id: "barber",
        header: "Serbest Berber",
        accessorKey: "fullName",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <EntityThumbnail
              name={r.fullName}
              imageList={r.imageList}
              subtitle={r.customerNumber ? `#${r.customerNumber}` : undefined}
            />
          );
        },
      },
      {
        id: "availability",
        header: "Durum",
        accessorFn: (row) => (row.isSuspended ? "Askıda" : row.isAvailable ? "Müsait" : "Meşgul"),
        cell: ({ row }) => {
          const r = row.original;
          if (r.isSuspended) return <Badge size="sm" color="error" variant="solid">Askıda</Badge>;
          return r.isAvailable
            ? <Badge size="sm" color="success">Müsait</Badge>
            : <Badge size="sm" color="warning">Meşgul</Badge>;
        },
      },
      {
        id: "location",
        header: "Konum",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.latitude.toFixed(4)}, {row.original.longitude.toFixed(4)}
          </span>
        ),
      },
      {
        id: "rating",
        header: "Puan",
        accessorKey: "rating",
        cell: ({ row }) => (
          <CellWithIcon icon="rating">
            <span className="text-sm">
              {(row.original.rating ?? 0).toFixed(1)}
              <span className="ml-1 text-xs text-gray-400">({row.original.reviewCount ?? 0})</span>
            </span>
          </CellWithIcon>
        ),
      },
      {
        id: "schedule",
        header: "Takvim",
        cell: ({ row }) => (
          <Link
            to={`/schedule?type=freebarber&id=${row.original.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ActionButton
              tone="primary"
              size="sm"
              icon={<AppIcon name="calendar" className="size-3.5" />}
            >
              Takvim
            </ActionButton>
          </Link>
        ),
      },
      {
        id: "services",
        header: "Hizmet",
        cell: ({ row }) => (
          <CellWithIcon icon="service">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {row.original.offerings?.length ?? 0} hizmet
              {(row.original.servicePackages?.length ?? 0) > 0
                ? ` · ${row.original.servicePackages!.length} paket`
                : ""}
            </span>
          </CellWithIcon>
        ),
      },
      {
        id: "actions",
        header: "İşlem",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2" data-stop-row-click>
              {r.isSuspended ? (
                <ActionButton
                  tone="success"
                  size="sm"
                  icon={<AppIcon name="check" className="size-3.5" />}
                  onClick={() => setUnsuspendTarget(r)}
                >
                  Askıyı Kaldır
                </ActionButton>
              ) : (
                <ActionButton
                  tone="warning"
                  size="sm"
                  icon={<AppIcon name="ban" className="size-3.5" />}
                  onClick={() => setSuspendTarget(r)}
                >
                  Askıya Al
                </ActionButton>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuspending],
  );

  return (
    <>
      <PageMeta title="Serbest Berberler | Gümüş Makas Admin" description="Serbest berber yönetimi" />
      <PageBreadcrumb pageTitle="Serbest Berberler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600">
          Liste yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <DataTable
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        emptyMessage="Serbest berber bulunamadı"
        emptyDescription="Henüz kayıtlı serbest berber paneli yok."
        emptyIcon={<AppIcon name="freeBarber" className="size-12 opacity-40" />}
        exportFilename="serbest-berberler"
        searchPlaceholder="Ad veya müşteri no ara..."
        searchKind="FreeBarber"
        onRowClick={(row) => setSelected(row)}
      />

      <FreeBarberDetailDrawer
        barber={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />

      <SuspendModal
        isOpen={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
        entityName={suspendTarget?.fullName ?? ""}
        isLoading={isSuspending}
      />

      <ConfirmModal
        isOpen={!!unsuspendTarget}
        onClose={() => setUnsuspendTarget(null)}
        onConfirm={handleUnsuspendConfirm}
        tone="success"
        title="Askıyı kaldır"
        message={
          <>
            <strong>{unsuspendTarget?.fullName}</strong> adlı serbest berberin askısını
            kaldırmak istediğinizden emin misiniz?
          </>
        }
        confirmText="Askıyı Kaldır"
        isLoading={isSuspending}
      />
    </>
  );
}
