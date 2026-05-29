export interface BadgeTabItem<T extends string> {
  id: T;
  label: string;
  badge?: number | string;
}

export default function BadgeTabs<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: BadgeTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-gray-100 px-4 py-4 dark:border-white/[0.05] sm:px-6 ${className}`}
      role="tablist"
    >
      <div className="inline-flex max-w-full flex-wrap gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "shadow-theme-xs bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
              }`}
            >
              {tab.label}
              {tab.badge != null && tab.badge !== "" ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                    isActive
                      ? "bg-brand-500/15 text-brand-600 dark:text-brand-400"
                      : "bg-gray-200/80 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
