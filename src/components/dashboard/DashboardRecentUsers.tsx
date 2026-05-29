import { Link } from "react-router";
import type { AdminUser } from "../../features/users/usersApi";
import { userTypeBadgeColor, userTypeLabels } from "../../features/users/userTypeLabels";
import UserAvatar from "../common/UserAvatar";
import Badge from "../ui/badge/Badge";

interface Props {
  users: AdminUser[];
  isLoading?: boolean;
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardRecentUsers({ users, isLoading }: Props) {
  const recent = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Son Kayıtlı Kullanıcılar
        </h3>
        <Link
          to="/users"
          className="text-xs font-medium text-brand-500 hover:underline"
        >
          Tümünü gör →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100 dark:bg-white/[0.05]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 animate-pulse rounded bg-gray-100 dark:bg-white/[0.05]" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
          <span className="text-3xl opacity-20">👤</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">Henüz kayıtlı kullanıcı yok</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {recent.map((u) => (
            <li key={u.id} className="flex items-center gap-3 py-2.5">
              <UserAvatar
                firstName={u.firstName}
                lastName={u.lastName}
                imageUrl={u.imageUrl ?? undefined}
                size={34}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {fmtDate(u.createdAt)}
                  {u.customerNumber ? ` · #${u.customerNumber}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge size="sm" color={userTypeBadgeColor[u.userType] ?? "info"}>
                  {userTypeLabels[u.userType]}
                </Badge>
                {u.isBanned && (
                  <Badge size="sm" color="error" variant="solid">Engelli</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
