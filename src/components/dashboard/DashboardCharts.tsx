import { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  AppointmentStatus,
  appointmentStatusLabels,
  type AdminAppointment,
} from "../../features/appointments/appointmentsApi";
import type { AdminComplaint } from "../../features/complaints/complaintsApi";
import type { AdminRequest } from "../../features/requests/requestsApi";

interface DashboardChartsProps {
  appointments: AdminAppointment[];
  storeCount: number;
  freeBarberCount: number;
  suspendedStores: number;
  suspendedFreeBarbers: number;
  complaints: AdminComplaint[];
  requests: AdminRequest[];
}

function buildDailyTrend(items: { createdAt?: string | null }[], days = 14) {
  const byDay = new Map<string, number>();
  for (const item of items) {
    const d = item.createdAt?.slice(0, 10);
    if (!d) continue;
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  const sorted = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-days);
  return {
    categories: sorted.map(([d]) =>
      new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
    ),
    data: sorted.map(([, c]) => c),
  };
}

const baseChart = {
  fontFamily: "Outfit, sans-serif",
  toolbar: { show: false },
};

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-2 text-center">
      <span className="text-3xl opacity-20">📊</span>
      <p className="text-sm text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}

export default function DashboardCharts({
  appointments,
  storeCount,
  freeBarberCount,
  suspendedStores,
  suspendedFreeBarbers,
  complaints,
  requests,
}: DashboardChartsProps) {
  const statusSeries = useMemo(() => {
    const statuses = [
      AppointmentStatus.Pending,
      AppointmentStatus.Approved,
      AppointmentStatus.Completed,
      AppointmentStatus.Cancelled,
      AppointmentStatus.Rejected,
      AppointmentStatus.Unanswered,
    ];
    return {
      labels: statuses.map((s) => appointmentStatusLabels[s]),
      series: statuses.map((s) => appointments.filter((a) => a.status === s).length),
    };
  }, [appointments]);

  const apptTrend = useMemo(() => buildDailyTrend(appointments), [appointments]);
  const complaintTrend = useMemo(() => buildDailyTrend(complaints), [complaints]);

  const requestStats = useMemo(() => {
    const open = requests.filter((r) => !r.isProcessed).length;
    const done = requests.length - open;
    return { open, done };
  }, [requests]);

  const lineOptions: ApexOptions = {
    chart: { ...baseChart, type: "area" },
    colors: ["#465fff"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
    dataLabels: { enabled: false },
    xaxis: { categories: apptTrend.categories },
    yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) }, min: 0 },
    grid: { strokeDashArray: 4 },
  };

  const complaintLineOptions: ApexOptions = {
    chart: { ...baseChart, type: "line" },
    colors: ["#f04438"],
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    xaxis: { categories: complaintTrend.categories },
    yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) }, min: 0 },
    grid: { strokeDashArray: 4 },
  };

  const donutOptions: ApexOptions = {
    chart: { ...baseChart },
    colors: ["#465fff", "#12b76a", "#f79009", "#f04438", "#717680", "#7a5af8"],
    labels: statusSeries.labels,
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
    plotOptions: {
      pie: { donut: { size: "62%", labels: { show: true, total: { show: true, label: "Toplam" } } } },
    },
  };

  // İşletme durumu — aktif vs askıda
  const entityMax = Math.max(storeCount, freeBarberCount, 3);
  const entityStatusOptions: ApexOptions = {
    chart: { ...baseChart, type: "bar", stacked: true },
    colors: ["#465fff", "#f04438"],
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "50%" } },
    dataLabels: { enabled: true, formatter: (val: number) => String(Math.round(val)) },
    xaxis: {
      categories: ["Salon", "Serbest Berber"],
      labels: { formatter: (v: string) => String(Math.round(Number(v))) },
      min: 0,
      max: entityMax,
      tickAmount: Math.min(entityMax, 5),
    },
    legend: { position: "top", fontSize: "12px" },
    grid: { strokeDashArray: 4 },
  };

  const requestDonutOptions: ApexOptions = {
    chart: { ...baseChart },
    colors: ["#f79009", "#12b76a"],
    labels: ["Açık", "İşlendi"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: "65%" } } },
  };

  const hasApptData = apptTrend.data.length > 0;
  const hasComplaintData = complaintTrend.data.length > 0;
  const hasStatusData = statusSeries.series.some((v) => v > 0);
  const hasRequestData = requestStats.open + requestStats.done > 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
      {/* Randevu Trendi — 2/3 genişlik */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-2">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
          Randevu Trendi
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Son 14 gün</p>
        {hasApptData ? (
          <Chart
            options={lineOptions}
            series={[{ name: "Randevu", data: apptTrend.data }]}
            type="area"
            height={280}
          />
        ) : (
          <EmptyState label="Henüz randevu verisi yok" />
        )}
      </div>

      {/* Randevu Durumları */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
          Randevu Durumları
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Dağılım (pasta)</p>
        {hasStatusData ? (
          <Chart
            options={donutOptions}
            series={statusSeries.series}
            type="donut"
            height={280}
          />
        ) : (
          <EmptyState label="Henüz randevu yok" />
        )}
      </div>

      {/* İşletme Durumu — aktif vs askıda */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
          İşletme Durumu
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Aktif ve askıdaki işletmeler</p>
        <Chart
          options={entityStatusOptions}
          series={[
            { name: "Aktif", data: [storeCount - suspendedStores, freeBarberCount - suspendedFreeBarbers] },
            { name: "Askıda", data: [suspendedStores, suspendedFreeBarbers] },
          ]}
          type="bar"
          height={240}
        />
      </div>

      {/* Şikayet Trendi */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
          Şikayet Trendi
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Son 14 gün</p>
        {hasComplaintData ? (
          <Chart
            options={complaintLineOptions}
            series={[{ name: "Şikayet", data: complaintTrend.data }]}
            type="line"
            height={240}
          />
        ) : (
          <EmptyState label="Henüz şikayet verisi yok" />
        )}
      </div>

      {/* Talep Durumu */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
          Talep Durumu
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Açık vs işlenmiş</p>
        {hasRequestData ? (
          <Chart
            options={requestDonutOptions}
            series={[requestStats.open, requestStats.done]}
            type="donut"
            height={240}
          />
        ) : (
          <EmptyState label="Henüz talep yok" />
        )}
      </div>
    </div>
  );
}
