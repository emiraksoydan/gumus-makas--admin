export type CompareWinner = "left" | "right" | "tie" | "skip";

export interface CompareMetricRow {
  label: string;
  left: string;
  right: string;
  winner: CompareWinner;
}

export default function CompareMetricTable({
  rows,
  leftLabel,
  rightLabel,
  variant = "store",
}: {
  rows: CompareMetricRow[];
  leftLabel: string;
  rightLabel: string;
  variant?: "store" | "freebarber";
}) {
  const accent =
    variant === "store"
      ? "border-brand-500/20 bg-brand-500/[0.04]"
      : "border-pink-500/20 bg-pink-500/[0.04]";

  return (
    <div className={`overflow-hidden rounded-2xl border ${accent}`}>
      <div className="grid grid-cols-3 gap-2 border-b border-gray-100 bg-white/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-gray-400">
        <span>Kriter</span>
        <span className="text-center text-brand-600 dark:text-brand-400">{leftLabel}</span>
        <span className="text-center text-blue-600 dark:text-blue-400">{rightLabel}</span>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {rows.map((row) => (
          <li key={row.label} className="grid grid-cols-3 items-center gap-2 px-4 py-3 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{row.label}</span>
            <CompareCell value={row.left} highlight={row.winner === "left"} tone="left" />
            <CompareCell value={row.right} highlight={row.winner === "right"} tone="right" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareCell({
  value,
  highlight,
  tone,
}: {
  value: string;
  highlight: boolean;
  tone: "left" | "right";
}) {
  const bg =
    highlight && tone === "left"
      ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
      : highlight && tone === "right"
        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
        : "text-gray-600 dark:text-gray-400";

  return (
    <div className={`rounded-lg px-2 py-1.5 text-center text-sm font-medium ${bg}`}>
      {value}
      {highlight ? (
        <span className="ml-1 inline-block text-[10px] text-success-600">●</span>
      ) : null}
    </div>
  );
}
