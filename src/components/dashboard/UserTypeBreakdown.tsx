import { useMemo } from "react";
import { useGetUsersQuery, UserType } from "../../features/users/usersApi";
import { userTypeLabels } from "../../features/users/userTypeLabels";
import AnimatedNumber from "../common/AnimatedNumber";

const typeOrder: UserType[] = [
  UserType.Customer,
  UserType.FreeBarber,
  UserType.BarberStore,
];

const typeColors: Record<UserType, string> = {
  [UserType.Customer]: "bg-blue-500",
  [UserType.FreeBarber]: "bg-success-500",
  [UserType.BarberStore]: "bg-brand-500",
};

export default function UserTypeBreakdown() {
  const { data, isLoading } = useGetUsersQuery();
  const users = data ?? [];

  const breakdown = useMemo(() => {
    const counts: Record<UserType, number> = {
      [UserType.Customer]: 0,
      [UserType.FreeBarber]: 0,
      [UserType.BarberStore]: 0,
    };
    for (const u of users) counts[u.userType] = (counts[u.userType] ?? 0) + 1;
    const total = users.length || 1; // 0 bölme koruması
    return { counts, total: users.length, pct: total };
  }, [users]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        Kullanıcı Tipi Dağılımı
      </h3>
      {isLoading ? (
        <div className="h-32 animate-pulse rounded bg-gray-100 dark:bg-white/[0.03]"></div>
      ) : (
        <>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.05]">
            {typeOrder.map((t) => {
              const c = breakdown.counts[t];
              const pct = breakdown.total > 0 ? (c / breakdown.total) * 100 : 0;
              return (
                <div
                  key={t}
                  className={typeColors[t]}
                  style={{ width: `${pct}%` }}
                  title={`${userTypeLabels[t]}: ${c}`}
                ></div>
              );
            })}
          </div>
          <ul className="mt-4 space-y-2">
            {typeOrder.map((t) => {
              const c = breakdown.counts[t];
              const pct =
                breakdown.total > 0 ? ((c / breakdown.total) * 100).toFixed(1) : "0";
              return (
                <li key={t} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-3 w-3 rounded-sm ${typeColors[t]}`}></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {userTypeLabels[t]}
                    </span>
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white/90 tabular-nums">
                    <AnimatedNumber value={c} />{" "}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({pct}%)
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
