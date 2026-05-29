import type { ReactNode } from "react";
import AppIcon from "../icons/AppIcon";
import type { AppIconName } from "../icons/app-icons";

export default function CellWithIcon({
  icon,
  children,
  iconClassName = "size-4 shrink-0 text-brand-500/80 dark:text-brand-400/80",
}: {
  icon: AppIconName;
  children: ReactNode;
  iconClassName?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <AppIcon name={icon} className={iconClassName} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
