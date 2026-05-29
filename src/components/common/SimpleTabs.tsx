export interface SimpleTabItem<T extends string> {
  id: T;
  label: string;
  badge?: number;
}

export default function SimpleTabs<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: SimpleTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap gap-0 border-b border-gray-200 dark:border-gray-800 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
              isActive
                ? "text-brand-600 dark:text-brand-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 ? (
              <span className="ml-1.5 rounded-full bg-brand-500/15 px-1.5 py-0.5 text-[10px] text-brand-600 dark:text-brand-300">
                {tab.badge}
              </span>
            ) : null}
            {isActive ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
