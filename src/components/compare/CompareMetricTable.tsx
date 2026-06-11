import AppIcon from "../icons/AppIcon";

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
            <CompareCell value={row.left} state={cellState(row.winner, "left")} />
            <CompareCell value={row.right} state={cellState(row.winner, "right")} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type CellState = "win" | "lose" | "neutral";

function cellState(winner: CompareWinner, side: "left" | "right"): CellState {
  if (winner === "tie" || winner === "skip") return "neutral";
  return winner === side ? "win" : "lose";
}

function CompareCell({ value, state }: { value: string; state: CellState }) {
  // Kazanan: yeşil + artış ikonu, kaybeden: kırmızı + azalış ikonu (aynı ton).
  const cls =
    state === "win"
      ? "bg-success-500/12 text-success-700 dark:bg-success-500/15 dark:text-success-300"
      : state === "lose"
        ? "bg-error-500/12 text-error-700 dark:bg-error-500/15 dark:text-error-300"
        : "text-gray-600 dark:text-gray-400";

  return (
    <div className={`flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-center text-sm font-medium ${cls}`}>
      {state === "win" ? (
        <AppIcon name="trendUp" className="size-3.5 shrink-0 text-success-600 dark:text-success-400" />
      ) : state === "lose" ? (
        <AppIcon name="trendDown" className="size-3.5 shrink-0 text-error-600 dark:text-error-400" />
      ) : null}
      <span>{value}</span>
    </div>
  );
}
