import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BadgeTabs from "../../components/common/BadgeTabs";
import Label from "../../components/form/Label";
import KpiCard from "../../components/dashboard/KpiCard";
import DataTable from "../../components/common/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import AppIcon from "../../components/icons/AppIcon";
import { useGetBarberStoresQuery } from "../../features/barberStores/barberStoresApi";
import { useGetFreeBarbersQuery } from "../../features/freeBarbers/freeBarbersApi";
import {
  useGetFreeBarberEarningsQuery,
  useGetStoreEarningsQuery,
  type EarningAppointmentRow,
} from "../../features/earnings/adminEarningsApi";
import { formatPercent, formatTry } from "../../utils/formatMoney";

type OwnerTab = "store" | "freebarber";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return { start: isoDate(start), end: isoDate(end) };
}

export default function EarningsPage() {
  const range = useMemo(() => defaultRange(), []);
  const [tab, setTab] = useState<OwnerTab>("store");
  const [startDate, setStartDate] = useState(range.start);
  const [endDate, setEndDate] = useState(range.end);
  const [storeId, setStoreId] = useState("");
  const [freeBarberUserId, setFreeBarberUserId] = useState("");

  const { data: stores = [] } = useGetBarberStoresQuery();
  const { data: freeBarbers = [] } = useGetFreeBarbersQuery();

  useEffect(() => {
    if (!storeId && stores[0]) setStoreId(stores[0].id);
  }, [stores, storeId]);

  useEffect(() => {
    if (!freeBarberUserId && freeBarbers[0]) setFreeBarberUserId(freeBarbers[0].freeBarberUserId);
  }, [freeBarbers, freeBarberUserId]);

  const storeQ = useGetStoreEarningsQuery(
    { storeId, startDate, endDate },
    { skip: tab !== "store" || !storeId },
  );
  const fbQ = useGetFreeBarberEarningsQuery(
    { freeBarberUserId, startDate, endDate },
    { skip: tab !== "freebarber" || !freeBarberUserId },
  );

  const detail = tab === "store" ? storeQ.data : fbQ.data;
  const isLoading = tab === "store" ? storeQ.isLoading : fbQ.isLoading;
  const summary = detail?.summary;
  const spark = summary?.dailyBreakdown.map((d) => d.amount) ?? [];
  const sparkDates = summary?.dailyBreakdown.map((d) => d.date.slice(5)) ?? [];

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "area", toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
      stroke: { curve: "smooth", width: 2 },
      colors: ["#465fff"],
      fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: summary?.dailyBreakdown.map((d) => d.date.slice(5)) ?? [],
        labels: { style: { fontSize: "11px" } },
      },
      yaxis: { labels: { formatter: (v) => `${Math.round(v)} ₺` } },
      tooltip: { y: { formatter: (v) => formatTry(v) } },
    }),
    [summary?.dailyBreakdown],
  );

  const columns = useMemo<ColumnDef<EarningAppointmentRow>[]>(
    () => [
      {
        id: "date",
        header: "Tamamlanma",
        accessorKey: "completedAt",
        cell: ({ row }) =>
          new Date(row.original.completedAt).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        id: "customer",
        header: "Müşteri",
        accessorKey: "customerDisplayName",
        cell: ({ row }) => row.original.customerDisplayName ?? "—",
      },
      {
        id: "counter",
        header: tab === "store" ? "Serbest berber" : "Salon",
        accessorKey: "counterpartyDisplayName",
        cell: ({ row }) => row.original.counterpartyDisplayName ?? "—",
      },
      {
        id: "services",
        header: "Hizmetler",
        accessorKey: "serviceSummary",
        cell: ({ row }) => (
          <span className="block max-w-[200px] truncate text-xs">
            {row.original.serviceSummary ?? "—"}
          </span>
        ),
      },
      {
        id: "total",
        header: "Hizmet tutarı",
        accessorKey: "servicesTotal",
        cell: ({ row }) => formatTry(row.original.servicesTotal),
      },
      {
        id: "earn",
        header: "Kazanç",
        accessorKey: "earningAmount",
        cell: ({ row }) => (
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            {formatTry(row.original.earningAmount)}
          </span>
        ),
      },
    ],
    [tab],
  );

  return (
    <>
      <PageMeta title="Kazançlar" description="Salon ve serbest berber kazanç analizi" />
      <PageBreadcrumb pageTitle="Kazançlar" />

      <div className="animate-content-in overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <BadgeTabs<OwnerTab>
          tabs={[
            { id: "store", label: "Berber Dükkanı", badge: stores.length },
            { id: "freebarber", label: "Serbest Berber", badge: freeBarbers.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="grid gap-4 border-b border-gray-100 p-4 dark:border-white/[0.05] sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
          <div className="lg:col-span-2">
            <Label>{tab === "store" ? "Salon" : "Serbest berber"}</Label>
            <select
              value={tab === "store" ? storeId : freeBarberUserId}
              onChange={(e) =>
                tab === "store" ? setStoreId(e.target.value) : setFreeBarberUserId(e.target.value)
              }
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
            >
              {tab === "store"
                ? stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.storeName}
                    </option>
                  ))
                : freeBarbers.map((f) => (
                    <option key={f.id} value={f.freeBarberUserId}>
                      {f.fullName}
                    </option>
                  ))}
            </select>
          </div>
          <div>
            <Label>Başlangıç</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
            />
          </div>
          <div>
            <Label>Bitiş</Label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white/90"
            />
          </div>
        </div>
      </div>

      <div className="animate-content-in mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Dönem kazancı"
          value={Math.round(summary?.totalEarnings ?? 0)}
          hint="Seçili tarih aralığı"
          formatValue={(n) => formatTry(n)}
          icon={<AppIcon name="money" className="size-6" />}
          isLoading={isLoading}
          accent="info"
          sparkline={spark}
          sparklineLabel="Günlük kazanç"
          categories={sparkDates}
          chartType="bar"
        />
        <KpiCard
          label="Bugün"
          value={Math.round(summary?.dailyEarnings ?? 0)}
          hint="Günlük toplam"
          formatValue={(n) => formatTry(n)}
          icon={<AppIcon name="time" className="size-6" />}
          isLoading={isLoading}
          accent="success"
          sparkline={spark.slice(-7)}
          sparklineLabel="Günlük kazanç"
          categories={sparkDates.slice(-7)}
          chartType="line"
        />
        <KpiCard
          label="Önceki dönem"
          value={Math.round(summary?.previousPeriodEarnings ?? 0)}
          hint="Karşılaştırma referansı"
          formatValue={(n) => formatTry(n)}
          icon={<AppIcon name="chart" className="size-6" />}
          isLoading={isLoading}
          accent="warning"
          sparkline={spark}
          sparklineLabel="Günlük kazanç"
          categories={sparkDates}
          chartType="area"
        />
        <KpiCard
          label="Değişim"
          value={summary?.changePercent ?? 0}
          hint={summary ? formatPercent(summary.changePercent) : "—"}
          formatValue={(n) => formatPercent(n)}
          valueDecimals={1}
          icon={<AppIcon name="chart" className="size-6" />}
          isLoading={isLoading}
          accent={
            (summary?.changePercent ?? 0) >= 0 ? "success" : "error"
          }
          sparkline={
            summary ? [0, summary.changePercent] : undefined
          }
          sparklineLabel="Değişim"
          chartType="stepline"
        />
      </div>

      <div className="animate-content-in mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03] sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Günlük kazanç grafiği
        </h3>
        {isLoading ? (
          <p className="py-12 text-center text-sm text-gray-500">Yükleniyor...</p>
        ) : !summary?.dailyBreakdown.length ? (
          <p className="py-12 text-center text-sm text-gray-500">Bu dönemde tamamlanan randevu yok.</p>
        ) : (
          <Chart
            options={chartOptions}
            series={[{ name: "Kazanç", data: summary.dailyBreakdown.map((d) => d.amount) }]}
            type="area"
            height={280}
          />
        )}
      </div>

      <div className="animate-content-in mt-6">
        <DataTable<EarningAppointmentRow>
          data={detail?.appointments ?? []}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Müşteri veya hizmet ara..."
          emptyMessage="Randevu kazancı bulunamadı."
          emptyIcon={<AppIcon name="money" className="size-12 opacity-40" />}
          exportFilename="kazanclar"
          initialPageSize={15}
        />
      </div>
    </>
  );
}
