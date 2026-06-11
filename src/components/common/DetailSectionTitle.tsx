import AppIcon from "../icons/AppIcon";
import type { AppIconName } from "../icons/app-icons";

/** Off-canvas içindeki bölümler için sade, ikonlu başlık. */
export default function DetailSectionTitle({
  icon,
  title,
  count,
}: {
  icon: AppIconName;
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-2.5 mt-5 flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
        <AppIcon name={icon} className="size-3.5" />
      </span>
      <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h4>
      {count != null ? (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">
          {count}
        </span>
      ) : null}
    </div>
  );
}
