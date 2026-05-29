import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import EntityThumbnail from "../../components/common/EntityThumbnail";
import Badge from "../../components/ui/badge/Badge";
import {
  useGetBarberStoresQuery,
  useSuspendBarberStoreMutation,
  type BarberStore,
} from "../../features/barberStores/barberStoresApi";
import StoreDetailDrawer from "../../features/barberStores/StoreDetailDrawer";
import SuspendModal from "../../components/common/SuspendModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import CellWithIcon from "../../components/common/CellWithIcon";
import AppIcon from "../../components/icons/AppIcon";
import ActionButton from "../../components/common/ActionButton";
import { barberTypeLabel } from "../../utils/entityLabels";
import { useToast } from "../../context/ToastContext";
import { notifyApiError } from "../../utils/notifyMutation";

export default function BarberStoresPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetBarberStoresQuery();
  const [suspendStore, { isLoading: isSuspending }] = useSuspendBarberStoreMutation();
  const toast = useToast();

  const [selected, setSelected] = useState<BarberStore | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<BarberStore | null>(null);
  const [unsuspendTarget, setUnsuspendTarget] = useState<BarberStore | null>(null);

  const handleSuspendConfirm = useCallback(async (reason: string) => {
    if (!suspendTarget) return;
    try {
      await suspendStore({ id: suspendTarget.id, suspend: true, reason: reason || undefined }).unwrap();
      setSuspendTarget(null);
      toast.success("Salon askıya alındı.");
    } catch (err) {
      notifyApiError(toast, err, "Askıya alma başarısız oldu.");
    }
  }, [suspendTarget, suspendStore, toast]);

  const handleUnsuspendConfirm = useCallback(async () => {
    if (!unsuspendTarget) return;
    try {
      await suspendStore({ id: unsuspendTarget.id, suspend: false }).unwrap();
      setUnsuspendTarget(null);
      toast.success("Salon askısı kaldırıldı.");
    } catch (err) {
      notifyApiError(toast, err, "Askı kaldırma başarısız oldu.");
    }
  }, [unsuspendTarget, suspendStore, toast]);

  const columns = useMemo<ColumnDef<BarberStore>[]>(() => [
    {
      id: "store",
      header: "Salon",
      accessorKey: "storeName",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <EntityThumbnail
            name={r.storeName}
            imageList={r.imageList}
            rounded="lg"
            subtitle={r.storeNo ? `#${r.storeNo}` : undefined}
          />
        );
      },
    },
    {
      id: "address",
      header: "Adres",
      accessorKey: "addressDescription",
      cell: ({ row }) => (
        <CellWithIcon icon="map">
          <span className="block max-w-[260px] truncate text-xs text-gray-500 dark:text-gray-400">
            {row.original.addressDescription ?? "—"}
          </span>
        </CellWithIcon>
      ),
    },
    {
      id: "type",
      header: "Tip",
      accessorKey: "type",
      cell: ({ row }) => (
        <CellWithIcon icon="store">
          <Badge size="sm" color="primary">{barberTypeLabel(row.original.type)}</Badge>
        </CellWithIcon>
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
      id: "favorites",
      header: "Favori",
      accessorKey: "favoriteCount",
      cell: ({ row }) => (
        <CellWithIcon icon="favorite">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.favoriteCount ?? 0}
          </span>
        </CellWithIcon>
      ),
    },
    {
      id: "schedule",
      header: "Takvim",
      cell: ({ row }) => (
        <Link
          to={`/schedule?type=store&id=${row.original.id}`}
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
      id: "open",
      header: "Durum",
      accessorFn: (row) => (row.isSuspended ? "Askıda" : row.isOpenNow ? "Açık" : "Kapalı"),
      cell: ({ row }) => {
        const r = row.original;
        if (r.isSuspended) return <Badge size="sm" color="error" variant="solid">Askıda</Badge>;
        return r.isOpenNow
          ? <Badge size="sm" color="success" variant="solid">Açık</Badge>
          : <Badge size="sm" color="warning" variant="solid">Kapalı</Badge>;
      },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [isSuspending]);

  return (
    <>
      <PageMeta title="Berber Salonları | Gümüş Makas Admin" description="Salon listesi" />
      <PageBreadcrumb pageTitle="Berber Salonları" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">Tekrar dene</button>
        </div>
      ) : null}

      <DataTable<BarberStore>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Salon adı, adres, no ara..."
        searchKind="Store"
        emptyMessage="Salon bulunamadı."
        exportFilename="berber-salonlari"
        emptyIcon={<AppIcon name="store" className="size-12 opacity-40" />}
        onRowClick={(row) => setSelected(row)}
      />

      <StoreDetailDrawer
        store={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />

      <SuspendModal
        isOpen={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspendConfirm}
        entityName={suspendTarget?.storeName ?? ""}
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
            <strong>{unsuspendTarget?.storeName}</strong> adlı salonun askısını kaldırmak
            istediğinizden emin misiniz?
          </>
        }
        confirmText="Askıyı Kaldır"
        isLoading={isSuspending}
      />
    </>
  );
}
