import { Link } from "react-router";
import {
  useGetAuditLogsQuery,
  getAuditActionLabel,
  type AuditLogItem,
} from "../../features/audit/auditApi";

function timeAgo(iso: string): string {
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec} sn önce`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} dk önce`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} saat önce`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} gün önce`;
    return date.toLocaleDateString("tr-TR");
  } catch {
    return "";
  }
}

function ActivityRow({ item }: { item: AuditLogItem }) {
  const label = getAuditActionLabel(item.action, item.actionName);
  return (
    <li className="flex items-start gap-3 px-5 py-4">
      <span
        className={`mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full ${
          item.success ? "bg-success-500" : "bg-error-500"
        }`}
        title={item.success ? "Başarılı" : "Başarısız"}
      ></span>
      <div className="flex flex-1 flex-col">
        <span className="text-sm text-gray-800 dark:text-white/90">{label}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.actorDisplayName ?? "Sistem / Anonim"}
          {item.clientIp ? ` • ${item.clientIp}` : ""}
        </span>
        {!item.success && item.failureReason && (
          <span className="mt-0.5 text-xs text-error-500">{item.failureReason}</span>
        )}
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(item.occurredAt)}</span>
    </li>
  );
}

export default function RecentAuditActivity() {
  const { data, isLoading } = useGetAuditLogsQuery({ page: 1, pageSize: 15 });
  const items = data?.items ?? [];

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Son Aktiviteler
        </h3>
        <Link
          to="/audit-logs"
          className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          Tümünü Gör →
        </Link>
      </div>
      {isLoading ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></span>
          <span className="ml-2">Yükleniyor...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Henüz aktivite kaydı yok.
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-gray-100 dark:divide-white/[0.05]">
          {items.map((it) => (
            <ActivityRow key={it.id} item={it} />
          ))}
        </ul>
      )}
    </div>
  );
}
