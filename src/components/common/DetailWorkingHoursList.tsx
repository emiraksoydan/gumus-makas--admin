import Badge from "../ui/badge/Badge";
import { dayOfWeekLabel, formatTimeSpan } from "../../utils/entityLabels";

export interface WorkingHourItem {
  id?: string;
  dayOfWeek: number;
  startTime?: string | null;
  endTime?: string | null;
  isClosed: boolean;
}

export default function DetailWorkingHoursList({
  hours,
}: {
  hours: WorkingHourItem[];
}) {
  if (!hours.length) return null;

  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Çalışma saatleri ({sorted.length})
      </p>
      <ul className="space-y-2">
        {sorted.map((h, i) => (
          <li
            key={h.id ?? i}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <span className="font-medium text-gray-800 dark:text-white/90">
              {dayOfWeekLabel(h.dayOfWeek)}
            </span>
            {h.isClosed ? (
              <Badge size="sm" color="warning">Kapalı</Badge>
            ) : (
              <span className="text-gray-600 dark:text-gray-300">
                {formatTimeSpan(h.startTime)} – {formatTimeSpan(h.endTime)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
