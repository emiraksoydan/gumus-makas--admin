import { useMemo } from "react";
import { Link } from "react-router";
import {
  getAuditActionLabel,
  useGetAuditLogsQuery,
} from "../../features/audit/auditApi";

export default function DashboardAuditSummary() {
  const { data, isLoading } = useGetAuditLogsQuery({ page: 1, pageSize: 200 });
  const items = data?.items ?? [];

  const stats = useMemo(() => {
    let success = 0;
    let failed = 0;
    let mobile = 0;
    let admin = 0;
    const topActions = new Map<string, number>();

    for (const item of items) {
      if (item.success) success++;
      else failed++;
      if (item.action >= 100) admin++;
      else mobile++;

      const label = getAuditActionLabel(item.action, item.actionName);
      topActions.set(label, (topActions.get(label) ?? 0) + 1);
    }

    const top3 = [...topActions.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const total = items.length || 1;
    return {
      success,
      failed,
      mobile,
      admin,
      top3,
      successPct: ((success / total) * 100).toFixed(0),
    };
  }, [items]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Denetim Özeti
        </h3>
        <Link
          to="/audit-logs"
          className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Detay →
        </Link>
      </div>

      {isLoading ? (
        <div className="h-36 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.03]" />
      ) : (
        <>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Son {items.length} kayıt — mobil uygulama ve admin işlemleri
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Başarılı
              </p>
              <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                {stats.success}
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (%{stats.successPct})
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Başarısız
              </p>
              <p className="text-lg font-semibold text-error-600 dark:text-error-400">
                {stats.failed}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Mobil / Uygulama
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {stats.mobile}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Admin Panel
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {stats.admin}
              </p>
            </div>
          </div>

          {stats.top3.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Sık Görülen İşlemler
              </p>
              <ul className="space-y-2">
                {stats.top3.map(([label, count]) => (
                  <li
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/[0.03]"
                  >
                    <span className="truncate pr-2 text-gray-700 dark:text-gray-300">
                      {label}
                    </span>
                    <span className="shrink-0 font-medium text-gray-800 dark:text-white/90">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
