import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAnimatedMount } from "../../hooks/useAnimatedMount";
import AppIcon from "../icons/AppIcon";

interface EntityDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  header?: ReactNode;
  children: ReactNode;
  widthClass?: string;
}

export default function EntityDetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  header,
  children,
  widthClass = "max-w-xl",
}: EntityDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { shouldRender, state } = useAnimatedMount(isOpen, 300);

  useEffect(() => {
    if (!shouldRender) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [shouldRender, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex">
      <div
        className="gm-overlay-backdrop fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
        data-state={state}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-state={state}
        className={`gm-drawer-panel relative ml-auto flex h-full w-full ${widthClass} flex-col bg-white shadow-2xl dark:bg-gray-900`}
      >
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500" />
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Kapat"
          >
            <AppIcon name="close" className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {header}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-gray-100 py-3 last:border-b-0 dark:border-gray-800">
      <p className="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-800 dark:text-white/90">{value}</div>
    </div>
  );
}

EntityDetailDrawer.Row = DetailRow;
