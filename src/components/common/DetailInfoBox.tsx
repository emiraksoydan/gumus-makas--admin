import type { ReactNode } from "react";
import AppIcon from "../icons/AppIcon";
import type { AppIconName } from "../icons/app-icons";

export default function DetailInfoBox({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: ReactNode;
  /** Opsiyonel başlık ikonu. */
  icon?: AppIconName;
  className?: string;
}) {
  return (
    <div
      className={`group rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 transition hover:border-brand-200 hover:bg-white dark:border-white/[0.05] dark:bg-white/[0.03] dark:hover:border-brand-500/30 ${className}`}
    >
      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {icon ? (
          <AppIcon
            name={icon}
            className="size-3.5 text-brand-500 dark:text-brand-400"
          />
        ) : null}
        {label}
      </p>
      <div className="text-sm font-medium text-gray-800 dark:text-white/90">{value}</div>
    </div>
  );
}
