import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DataTable from "../../components/common/DataTable";
import UserAvatar from "../../components/common/UserAvatar";
import ActionButton from "../../components/common/ActionButton";
import ConfirmModal from "../../components/common/ConfirmModal";
import Badge from "../../components/ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, PlusIcon, TrashBinIcon } from "../../icons";
import AppIcon from "../../components/icons/AppIcon";
import {
  useDeleteAdminMutation,
  useGetAdminsQuery,
  useSetAdminActiveMutation,
  type AdminUserItem,
} from "../../features/admins/adminsApi";
import CreateAdminModal from "../../features/admins/CreateAdminModal";
import AdminDetailDrawer from "../../features/admins/AdminDetailDrawer";
import { useAppSelector } from "../../store/hooks";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiError";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function AdminsPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetAdminsQuery();
  const [setActive, { isLoading: isToggling }] = useSetAdminActiveMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<AdminUserItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserItem | null>(null);
  const [detailAdmin, setDetailAdmin] = useState<AdminUserItem | null>(null);
  const currentEmail = useAppSelector((s) => s.auth.admin?.email);
  const toast = useToast();

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    try {
      await setActive({ id: toggleTarget.id, isActive: !toggleTarget.isActive }).unwrap();
      setToggleTarget(null);
      toast.success("Admin durumu güncellendi.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "İşlem başarısız oldu."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdmin(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      toast.success("Admin silindi.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Silme başarısız."));
    }
  };

  const columns = useMemo<ColumnDef<AdminUserItem>[]>(
    () => [
      {
        id: "admin",
        header: "Admin",
        accessorFn: (row) => `${row.fullName} ${row.email}`,
        cell: ({ row }) => {
          const a = row.original;
          const isSelf = a.email.toLowerCase() === (currentEmail ?? "").toLowerCase();
          const first = a.fullName?.split(" ")[0];
          const last = a.fullName?.split(" ").slice(1).join(" ");
          return (
            <div className="flex items-center gap-3">
              <UserAvatar
                firstName={first}
                lastName={last}
                imageUrl={a.profileImageUrl ?? undefined}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {a.fullName || "Admin"}
                  {isSelf && (
                    <span className="ml-2 text-[10px] font-medium uppercase text-brand-500">
                      (Sen)
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {a.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Durum",
        accessorFn: (row) => (row.isActive ? "Aktif" : "Pasif"),
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge size="sm" color="success" variant="solid">Aktif</Badge>
          ) : (
            <Badge size="sm" color="warning" variant="solid">Pasif</Badge>
          ),
      },
      {
        id: "lastLogin",
        header: "Son Giriş",
        accessorKey: "lastLoginAt",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(row.original.lastLoginAt)}
          </span>
        ),
      },
      {
        id: "createdAt",
        header: "Oluşturulma",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "İşlem",
        enableSorting: false,
        cell: ({ row }) => {
          const a = row.original;
          const isSelf = a.email.toLowerCase() === (currentEmail ?? "").toLowerCase();
          if (isSelf) {
            return <span className="text-xs text-gray-400">—</span>;
          }
          return (
            <div className="flex flex-wrap items-center gap-2" data-stop-row-click>
              {a.isActive ? (
                <ActionButton
                  tone="neutral"
                  variant="soft"
                  icon={<CloseLineIcon className="size-4" />}
                  onClick={() => setToggleTarget(a)}
                  disabled={isToggling}
                >
                  Pasifleştir
                </ActionButton>
              ) : (
                <ActionButton
                  tone="success"
                  icon={<CheckLineIcon className="size-4" />}
                  onClick={() => setToggleTarget(a)}
                  disabled={isToggling}
                >
                  Aktive Et
                </ActionButton>
              )}
              <ActionButton
                tone="danger"
                icon={<TrashBinIcon className="size-4" />}
                onClick={() => setDeleteTarget(a)}
                disabled={isDeleting}
              >
                Sil
              </ActionButton>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentEmail, isToggling, isDeleting],
  );

  return (
    <>
      <PageMeta title="Admin Yönetimi | Gümüş Makas Admin" description="Admin kullanıcı yönetimi" />
      <PageBreadcrumb pageTitle="Admin Yönetimi" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Admin listesi yüklenemedi.
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <DataTable<AdminUserItem>
        data={data ?? []}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Email veya ad ara..."
        searchKind="Admin"
        emptyMessage="Admin bulunamadı."
        exportFilename="yoneticiler"
        emptyIcon={<AppIcon name="admin" className="size-12 opacity-40" />}
        onRowClick={setDetailAdmin}
        toolbarRight={
          <ActionButton
            tone="success"
            size="md"
            icon={<PlusIcon className="size-4" />}
            onClick={() => setShowCreate(true)}
          >
            Yeni Admin
          </ActionButton>
        }
      />

      <CreateAdminModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      <ConfirmModal
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleConfirmToggle}
        tone={toggleTarget?.isActive ? "warning" : "success"}
        title={toggleTarget?.isActive ? "Admini pasifleştir" : "Admini aktive et"}
        message={
          <>
            <strong>{toggleTarget?.email}</strong> hesabını{" "}
            {toggleTarget?.isActive ? "pasifleştirmek" : "aktive etmek"} istediğinize emin misiniz?
            {toggleTarget?.isActive && (
              <p className="mt-2 text-xs text-warning-600">
                Pasifleştirilen admin login olamaz; mevcut refresh token'ı da geçersiz kılınır.
              </p>
            )}
          </>
        }
        confirmText={toggleTarget?.isActive ? "Pasifleştir" : "Aktive Et"}
        isLoading={isToggling}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        tone="danger"
        title="Admini sil"
        message={
          <>
            <strong>{deleteTarget?.email}</strong> hesabı kalıcı olarak silinecek.
            <p className="mt-2 text-xs text-error-600">Bu işlem geri alınamaz.</p>
          </>
        }
        confirmText="Sil"
        isLoading={isDeleting}
      />

      <AdminDetailDrawer
        admin={detailAdmin}
        isOpen={!!detailAdmin}
        onClose={() => setDetailAdmin(null)}
      />
    </>
  );
}
