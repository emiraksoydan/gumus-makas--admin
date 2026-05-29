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
import ActionButton from "../../components/common/ActionButton";
import ConfirmModal from "../../components/common/ConfirmModal";
import Badge from "../../components/ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, DollarLineIcon } from "../../icons";
import AppIcon from "../../components/icons/AppIcon";
import {
  useGetUsersQuery,
  useUnbanUserMutation,
  UserType,
  type AdminUser,
} from "../../features/users/usersApi";
import { userTypeBadgeColor, userTypeLabels } from "../../features/users/userTypeLabels";
import BanUserModal from "../../features/users/BanUserModal";
import SubscriptionModal from "../../features/users/SubscriptionModal";
import UserDetailDrawer from "../../features/users/UserDetailDrawer";
import { useToast } from "../../context/ToastContext";
import { notifyApiError } from "../../utils/notifyMutation";


function formatDate(iso?: string | null) {
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

type UserTypeFilter = "all" | `${UserType}`;
type UserBanFilter = "all" | "banned" | "active";

const USER_FILTER_FIELDS: TableFilterField[] = [
  {
    type: "select",
    key: "userType",
    label: "Kullanıcı tipi",
    options: [
      { value: "all", label: "Tüm tipler" },
      { value: "0", label: "Müşteri" },
      { value: "1", label: "Serbest Berber" },
      { value: "2", label: "Berber Salonu" },
    ],
  },
  {
    type: "toggle",
    key: "ban",
    label: "Hesap durumu",
    options: [
      { value: "all", label: "Tümü" },
      { value: "active", label: "Aktif" },
      { value: "banned", label: "Engelli" },
    ],
  },
];

export default function UsersPage() {
  const { data, isLoading, isFetching, refetch, error } = useGetUsersQuery();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();
  const [filterValues, setFilterValues] = useState<TableFilterValues>({
    userType: "all",
    ban: "all",
  });
  const typeFilter = (filterValues.userType as UserTypeFilter) ?? "all";
  const banFilter = (filterValues.ban as UserBanFilter) ?? "all";

  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [subTarget, setSubTarget] = useState<AdminUser | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const toast = useToast();

  const filteredUsers = useMemo(() => {
    let rows = data ?? [];
    if (typeFilter !== "all") {
      const t = Number(typeFilter) as UserType;
      rows = rows.filter((u) => u.userType === t);
    }
    if (banFilter === "banned") rows = rows.filter((u) => u.isBanned);
    if (banFilter === "active") rows = rows.filter((u) => !u.isBanned);
    return rows;
  }, [data, typeFilter, banFilter]);

  const handleConfirmUnban = async () => {
    if (!unbanTarget) return;
    try {
      await unbanUser(unbanTarget.id).unwrap();
      setUnbanTarget(null);
      toast.success("Kullanıcı engeli kaldırıldı.");
    } catch (err) {
      notifyApiError(toast, err, "Engel kaldırma başarısız oldu.");
    }
  };

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "user",
        header: "Kullanıcı",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar
                firstName={u.firstName}
                lastName={u.lastName}
                imageUrl={u.imageUrl ?? undefined}
              />
              <div className="flex flex-col leading-tight">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {u.firstName} {u.lastName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  #{u.customerNumber}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: "Telefon",
        accessorKey: "phoneNumber",
      },
      {
        id: "type",
        header: "Tür",
        accessorFn: (row) => userTypeLabels[row.userType] ?? String(row.userType),
        cell: ({ row }) => (
          <Badge size="sm" color={userTypeBadgeColor[row.original.userType] ?? "info"}>
            {userTypeLabels[row.original.userType] ?? String(row.original.userType)}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Durum",
        accessorFn: (row) => (row.isBanned ? "Engelli" : row.isActive ? "Aktif" : "Pasif"),
        cell: ({ row }) => {
          const u = row.original;
          if (u.isBanned) return <Badge size="sm" color="error" variant="solid">Engelli</Badge>;
          if (!u.isActive) return <Badge size="sm" color="warning" variant="solid">Pasif</Badge>;
          return <Badge size="sm" color="success" variant="solid">Aktif</Badge>;
        },
      },
      {
        id: "createdAt",
        header: "Kayıt",
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
          const u = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2" data-stop-row-click>
              {u.isBanned ? (
                <ActionButton
                  tone="success"
                  icon={<CheckLineIcon className="size-4" />}
                  onClick={() => setUnbanTarget(u)}
                  disabled={isUnbanning}
                >
                  Engeli Kaldır
                </ActionButton>
              ) : (
                <ActionButton
                  tone="danger"
                  icon={<CloseLineIcon className="size-4" />}
                  onClick={() => setBanTarget(u)}
                >
                  Engelle
                </ActionButton>
              )}
              <ActionButton
                tone="primary"
                variant="outline"
                icon={<DollarLineIcon className="size-4" />}
                onClick={() => setSubTarget(u)}
              >
                Abonelik
              </ActionButton>
            </div>
          );
        },
      },
    ],
    [isUnbanning],
  );

  return (
    <>
      <PageMeta title="Kullanıcılar | Gümüş Makas Admin" description="Kullanıcı yönetimi" />
      <div className="mb-4">
        <PageBreadcrumb pageTitle="Kullanıcılar" />
      </div>


      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Kullanıcı listesi yüklenemedi.
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-2 underline"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      <DataTable<AdminUser>
        data={filteredUsers}
        columns={columns}
        isLoading={isLoading || isFetching}
        searchPlaceholder="Ad, telefon, müşteri no ara..."
        searchKind="User"
        emptyMessage="Kullanıcı bulunamadı."
        exportFilename="kullanicilar"
        emptyIcon={<AppIcon name="users" className="size-12 opacity-40" />}
        onRowClick={setDetailUser}
        filterControl={
          <TableFilterDropdown
            fields={USER_FILTER_FIELDS}
            values={filterValues}
            onChange={setFilterValues}
          />
        }
      />

      <UserDetailDrawer
        user={detailUser}
        isOpen={!!detailUser}
        onClose={() => setDetailUser(null)}
      />

      <BanUserModal
        user={banTarget}
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
      />
      <SubscriptionModal
        user={subTarget}
        isOpen={!!subTarget}
        onClose={() => setSubTarget(null)}
      />
      <ConfirmModal
        isOpen={!!unbanTarget}
        onClose={() => setUnbanTarget(null)}
        onConfirm={handleConfirmUnban}
        tone="success"
        title="Engeli kaldır"
        message={
          <>
            <strong>
              {unbanTarget?.firstName} {unbanTarget?.lastName}
            </strong>{" "}
            adlı kullanıcının engelini kaldırmak istediğinize emin misiniz?
          </>
        }
        confirmText="Engeli Kaldır"
        isLoading={isUnbanning}
      />
    </>
  );
}
