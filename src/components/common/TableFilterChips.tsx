export interface TableFilterOption<T> {
  value: T;
  label: string;
}

export default function TableFilterChips<T>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: TableFilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
            value === opt.value
              ? "bg-brand-500 text-white shadow-theme-xs"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
