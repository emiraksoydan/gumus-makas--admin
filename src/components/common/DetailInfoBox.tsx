import type { ReactNode } from "react";

export default function DetailInfoBox({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}
    >
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-800 dark:text-white/90">{value}</div>
    </div>
  );
}
