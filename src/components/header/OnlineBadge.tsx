import { useState } from "react";
import { useGetOnlineCountQuery } from "../../features/online/onlineApi";
import AnimatedNumber from "../common/AnimatedNumber";
import { useAppSelector } from "../../store/hooks";

export default function OnlineBadge() {
  const token = useAppSelector((s) => s.auth.token);
  const { data, isLoading } = useGetOnlineCountQuery(undefined, {
    pollingInterval: 15_000,
    skip: !token,
  });
  const [showTooltip, setShowTooltip] = useState(false);

  if (isLoading || !data) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-xl border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 transition-colors hover:bg-success-100 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/15"
        aria-label="Anlık çevrimiçi kullanıcı sayısı"
      >
        {/* Nabız noktası */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
        </span>
        <AnimatedNumber value={data.total} duration={0.6} />
        <span className="hidden sm:inline">çevrimiçi</span>
      </button>

      {/* Hover tooltip — breakdown */}
      {showTooltip && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-gray-900">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Dağılım
          </p>
          <ul className="space-y-1.5">
            {[
              { label: "Müşteri", value: data.customers, color: "text-blue-500" },
              { label: "Serbest Berber", value: data.freeBarbers, color: "text-success-500" },
              { label: "Berber Salonu", value: data.stores, color: "text-brand-500" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">{row.label}</span>
                <span className={`font-semibold tabular-nums ${row.color}`}>{row.value}</span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-gray-100 pt-1.5 text-xs dark:border-white/[0.06]">
              <span className="font-medium text-gray-700 dark:text-gray-200">Toplam</span>
              <span className="font-bold text-gray-800 dark:text-white">{data.total}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
