interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

/**
 * Tek satır/blok skeleton placeholder.
 * @example <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className = "h-4 w-full", rounded = "md" }: SkeletonProps) {
  return (
    <span
      className={`inline-block animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] dark:from-white/[0.06] dark:via-white/[0.10] dark:to-white/[0.06] ${roundedClasses[rounded]} ${className}`}
      style={{ animation: "shimmer 1.6s ease-in-out infinite" }}
    />
  );
}

interface TableRowSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * DataTable / liste için satır skeleton'ları.
 */
export function TableRowSkeleton({ rows = 5, columns = 5 }: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr
          key={r}
          className="border-b border-gray-200 last:border-b-0 dark:border-white/[0.08]"
        >
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c} className="px-5 py-3.5">
              <Skeleton
                className={`h-4 ${
                  c === 0 ? "w-3/4" : c === columns - 1 ? "w-16" : "w-1/2"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Genel sayfa veya widget yükleme spinner'ı.
 */
export function PageSpinner({ label = "Yükleniyor..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-sm text-gray-500 dark:text-gray-400">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/30"></div>
        <div className="relative h-12 w-12 animate-spin rounded-full border-[3px] border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
      </div>
      <span className="font-medium">{label}</span>
    </div>
  );
}
