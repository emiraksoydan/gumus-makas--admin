import type { ReactNode } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import AnimatedNumber from "../common/AnimatedNumber";

export type KpiChartType = "area" | "bar" | "line" | "stepline";

interface KpiCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: ReactNode;
  isLoading?: boolean;
  accent?: "brand" | "success" | "warning" | "error" | "info" | "purple";
  sparkline?: number[];
  chartType?: KpiChartType;
  formatValue?: (n: number) => string;
  /** formatValue ile birlikte animasyon ondalığı (ör. yüzde için 1) */
  valueDecimals?: number;
  /** Grafik tooltip başlığı — sparkline farklı bir metriği gösteriyorsa (ör. "Günlük yeni") */
  sparklineLabel?: string;
  /** Sparkline x ekseni etiketleri (her veri noktasına karşılık gelen gün/tarih). Verilirse hover'da gösterilir. */
  categories?: string[];
}

const accentClasses: Record<
  NonNullable<KpiCardProps["accent"]>,
  {
    card: string;
    iconWrap: string;
    iconColor: string;
    valueColor: string;
    hintColor: string;
    labelColor: string;
    chart: string[];
    chartStroke: number;
  }
> = {
  brand: {
    card: "border-brand-200/80 dark:border-brand-500/30",
    iconWrap: "bg-brand-50 dark:bg-brand-500/15",
    iconColor: "text-brand-600 dark:text-brand-400",
    valueColor: "text-gray-900 dark:text-white",
    hintColor: "text-gray-500 dark:text-gray-400",
    labelColor: "text-gray-600 dark:text-gray-300",
    chart: ["#465fff"],
    chartStroke: 2,
  },
  success: {
    card: "border-success-200/80 dark:border-success-500/30",
    iconWrap: "bg-success-50 dark:bg-success-500/15",
    iconColor: "text-success-600 dark:text-success-400",
    valueColor: "text-gray-900 dark:text-white",
    hintColor: "text-gray-500 dark:text-gray-400",
    labelColor: "text-gray-600 dark:text-gray-300",
    chart: ["#12b76a"],
    chartStroke: 2,
  },
  warning: {
    card: "border-warning-200/80 dark:border-warning-500/30",
    iconWrap: "bg-warning-50 dark:bg-warning-500/15",
    iconColor: "text-warning-600 dark:text-warning-400",
    valueColor: "text-gray-900 dark:text-white",
    hintColor: "text-gray-500 dark:text-gray-400",
    labelColor: "text-gray-600 dark:text-gray-300",
    chart: ["#f79009"],
    chartStroke: 2,
  },
  error: {
    card: "border-error-200/80 dark:border-error-500/30",
    iconWrap: "bg-error-50 dark:bg-error-500/15",
    iconColor: "text-error-600 dark:text-error-400",
    valueColor: "text-gray-900 dark:text-white",
    hintColor: "text-gray-500 dark:text-gray-400",
    labelColor: "text-gray-600 dark:text-gray-300",
    chart: ["#f04438"],
    chartStroke: 2,
  },
  info: {
    card: "border-blue-200/80 dark:border-blue-500/30",
    iconWrap: "bg-blue-50 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    valueColor: "text-gray-900 dark:text-white",
    hintColor: "text-gray-500 dark:text-gray-400",
    labelColor: "text-gray-600 dark:text-gray-300",
    chart: ["#2e90fa"],
    chartStroke: 2,
  },
  purple: {
    card: "border-purple-200/80 dark:border-purple-500/30",
    iconWrap: "bg-purple-50 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400",
    valueColor: "text-gray-900 dark:text-white",
    hintColor: "text-gray-500 dark:text-gray-400",
    labelColor: "text-gray-600 dark:text-gray-300",
    chart: ["#7a5af8"],
    chartStroke: 2,
  },
};

function buildSparkOptions(
  colors: string[],
  chartType: KpiChartType,
  strokeWidth: number,
  label: string,
  formatValue?: (n: number) => string,
  categories?: string[],
): ApexOptions {
  const apexType = chartType === "stepline" ? "line" : chartType;
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  const base: ApexOptions = {
    chart: {
      type: apexType,
      sparkline: { enabled: true },
      animations: { enabled: true, speed: 400 },
      toolbar: { show: false },
    },
    colors,
    // Kategoriler verilirse hover'da hangi güne/tarihe ait olduğu görünür.
    // Sparkline ekseni gizli tutar; bu yalnızca tooltip başlığını besler.
    ...(hasCategories
      ? {
          xaxis: {
            categories,
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
          },
        }
      : {}),
    tooltip: {
      enabled: true,
      x: { show: hasCategories },
      y: {
        formatter: (val: number) =>
          formatValue ? formatValue(val) : `${val.toLocaleString("tr-TR")}`,
        title: { formatter: () => label },
      },
      marker: { show: true },
    },
    grid: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    dataLabels: { enabled: false },
  };

  if (chartType === "bar") {
    return {
      ...base,
      plotOptions: {
        bar: { borderRadius: 3, columnWidth: "55%" },
      },
    };
  }

  if (chartType === "line" || chartType === "stepline") {
    return {
      ...base,
      stroke: {
        curve: chartType === "stepline" ? "stepline" : "smooth",
        width: strokeWidth,
      },
      markers: { size: 0 },
    };
  }

  return {
    ...base,
    stroke: { curve: "smooth", width: strokeWidth },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 0.25, opacityFrom: 0.45, opacityTo: 0.08 },
    },
  };
}

export default function KpiCard({
  label,
  value,
  hint,
  icon,
  isLoading,
  accent = "brand",
  sparkline,
  chartType = "area",
  formatValue,
  valueDecimals = 0,
  sparklineLabel,
  categories,
}: KpiCardProps) {
  const c = accentClasses[accent];
  const series =
    sparkline && sparkline.length > 0
      ? sparkline
      : [0, value || 0, Math.max(0, value - 1), value];
  const apexType = chartType === "stepline" ? "line" : chartType;

  return (
    <div
      className={`rounded-2xl border bg-white px-5 pb-5 pt-3 shadow-sm transition hover:shadow-md dark:bg-gray-900 md:px-6 md:pb-6 md:pt-4 ${c.card}`}
    >
      <div className="mb-1 flex items-center gap-3">
        <div className="h-[52px] min-w-0 flex-1">
          {!isLoading ? (
            <Chart
              options={buildSparkOptions(c.chart, chartType, c.chartStroke, sparklineLabel ?? label, formatValue, categories)}
              series={[{ name: label, data: series }]}
              type={apexType}
              height={52}
              width="100%"
            />
          ) : (
            <div className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconWrap}`}
        >
          <span className={`size-5 [&_svg]:size-5 ${c.iconColor}`}>{icon}</span>
        </div>
      </div>

      <div className="-mt-0.5 flex items-end justify-between gap-3">
        <span className={`text-sm font-medium leading-tight ${c.labelColor}`}>{label}</span>
        <h4
          className={`text-2xl font-bold leading-none tabular-nums tracking-tight sm:text-3xl ${c.valueColor}`}
        >
          {isLoading ? (
            <span className="inline-block h-8 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ) : (
            <AnimatedNumber
              value={value}
              decimals={valueDecimals}
              formatFn={formatValue}
            />
          )}
        </h4>
      </div>

      {hint ? <p className={`mt-1 text-xs leading-snug ${c.hintColor}`}>{hint}</p> : null}
    </div>
  );
}
