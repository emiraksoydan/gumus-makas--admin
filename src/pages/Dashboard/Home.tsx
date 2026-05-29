import { useMemo } from "react";
import AnimatedNumber from "../../components/common/AnimatedNumber";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  AlertHexaIcon,
  CalenderIcon,
  GroupIcon,
  PaperPlaneIcon,
} from "../../icons";
import KpiCard from "../../components/dashboard/KpiCard";
import UserTypeBreakdown from "../../components/dashboard/UserTypeBreakdown";
import DashboardCharts from "../../components/dashboard/DashboardCharts";
import DashboardMapWidget from "../../components/dashboard/DashboardMapWidget";
import DashboardPlatformOverview from "../../components/dashboard/DashboardPlatformOverview";
import DashboardRecentUsers from "../../components/dashboard/DashboardRecentUsers";
import { useGetUsersQuery, UserType } from "../../features/users/usersApi";
import {
  useGetAppointmentsQuery,
  AppointmentStatus,
} from "../../features/appointments/appointmentsApi";
import { useGetComplaintsQuery } from "../../features/complaints/complaintsApi";
import { useGetRequestsQuery } from "../../features/requests/requestsApi";
import { useGetBarberStoresQuery } from "../../features/barberStores/barberStoresApi";
import { useGetFreeBarbersQuery } from "../../features/freeBarbers/freeBarbersApi";

export default function Home() {
  const usersQ = useGetUsersQuery();
  const apptQ = useGetAppointmentsQuery();
  const complaintsQ = useGetComplaintsQuery();
  const requestsQ = useGetRequestsQuery();
  const storesQ = useGetBarberStoresQuery();
  const freeBarbersQ = useGetFreeBarbersQuery();

  const userCount = usersQ.data?.length ?? 0;

  const bannedCount = useMemo(
    () => (usersQ.data ?? []).filter((u) => u.isBanned).length,
    [usersQ.data],
  );

  const suspendedStores = useMemo(
    () => (storesQ.data ?? []).filter((s) => s.isSuspended).length,
    [storesQ.data],
  );

  const suspendedFreeBarbers = useMemo(
    () => (freeBarbersQ.data ?? []).filter((b) => b.isSuspended).length,
    [freeBarbersQ.data],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayAppointments = useMemo(
    () =>
      (apptQ.data ?? []).filter((a) => {
        const d = new Date(a.appointmentDate ?? a.createdAt);
        return d >= today;
      }).length,
    [apptQ.data, today],
  );

  const pendingAppointments = useMemo(
    () => (apptQ.data ?? []).filter((a) => a.status === AppointmentStatus.Pending).length,
    [apptQ.data],
  );

  const unresolvedComplaints = useMemo(
    () => (complaintsQ.data ?? []).filter((c) => !c.isResolved).length,
    [complaintsQ.data],
  );

  const openRequestCount = useMemo(
    () => (requestsQ.data ?? []).filter((r) => !r.isProcessed).length,
    [requestsQ.data],
  );

  const storeCount = storesQ.data?.length ?? 0;
  const freeBarberCount = freeBarbersQ.data?.length ?? 0;

  const customerCount = useMemo(
    () => (usersQ.data ?? []).filter((u) => u.userType === UserType.Customer && !u.isBanned).length,
    [usersQ.data],
  );

  const completedAppointments = useMemo(
    () => (apptQ.data ?? []).filter((a) => a.status === AppointmentStatus.Completed).length,
    [apptQ.data],
  );

  const newUsersThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return (usersQ.data ?? []).filter((u) => new Date(u.createdAt) >= weekAgo).length;
  }, [usersQ.data]);

  const userSpark = useMemo(() => {
    const users = usersQ.data ?? [];
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    users.forEach((u) => {
      const diff = Math.floor((now.getTime() - new Date(u.createdAt).getTime()) / 86_400_000);
      if (diff >= 0 && diff < 7) buckets[6 - diff] += 1;
    });
    return buckets;
  }, [usersQ.data]);

  // Son 7 günün etiketleri (sparkline buckets[0..6] ile aynı sıra: index 6 = bugün)
  const last7DayLabels = useMemo(() => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels.push(
        d.toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      );
    }
    return labels;
  }, []);

  const apptSpark = useMemo(() => {
    const appts = apptQ.data ?? [];
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    appts.forEach((a) => {
      const diff = Math.floor(
        (now.getTime() - new Date(a.appointmentDate ?? a.createdAt).getTime()) / 86_400_000,
      );
      if (diff >= 0 && diff < 7) buckets[6 - diff] += 1;
    });
    return buckets;
  }, [apptQ.data]);

  const complaintSpark = useMemo(() => {
    const items = complaintsQ.data ?? [];
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    items.forEach((c) => {
      const diff = Math.floor((now.getTime() - new Date(c.createdAt).getTime()) / 86_400_000);
      if (diff >= 0 && diff < 7) buckets[6 - diff] += 1;
    });
    return buckets;
  }, [complaintsQ.data]);

  const requestSpark = useMemo(() => {
    const items = requestsQ.data ?? [];
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    items.forEach((r) => {
      const diff = Math.floor((now.getTime() - new Date(r.createdAt).getTime()) / 86_400_000);
      if (diff >= 0 && diff < 7) buckets[6 - diff] += 1;
    });
    return buckets;
  }, [requestsQ.data]);

  const isPlatformLoading =
    storesQ.isLoading ||
    freeBarbersQ.isLoading ||
    apptQ.isLoading ||
    complaintsQ.isLoading ||
    requestsQ.isLoading ||
    usersQ.isLoading;

  return (
    <>
      <PageMeta
        title="Gösterge Paneli"
        description="Yönetim paneli özet istatistikleri ve son aktiviteler"
      />
      <PageBreadcrumb pageTitle="Gösterge Paneli" />

      {/* KPI Kartları */}
      <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        <KpiCard
          label="Toplam Kullanıcı"
          value={userCount}
          hint={`Bu hafta +${newUsersThisWeek} yeni`}
          icon={<GroupIcon />}
          isLoading={usersQ.isLoading}
          accent="info"
          sparkline={userSpark}
          sparklineLabel="Günlük yeni kullanıcı"
          categories={last7DayLabels}
          chartType="bar"
        />
        <KpiCard
          label="Bugünkü Randevular"
          value={todayAppointments}
          hint={`${pendingAppointments} onay bekliyor`}
          icon={<CalenderIcon />}
          isLoading={apptQ.isLoading}
          accent="success"
          sparkline={apptSpark}
          sparklineLabel="Günlük randevu"
          categories={last7DayLabels}
          chartType="line"
        />
        <KpiCard
          label="Çözümsüz Şikayetler"
          value={unresolvedComplaints}
          hint={unresolvedComplaints > 0 ? "İncelemeye al" : "Tüm şikayetler çözümlendi"}
          icon={<AlertHexaIcon />}
          isLoading={complaintsQ.isLoading}
          accent="error"
          sparkline={complaintSpark}
          sparklineLabel="Günlük yeni şikayet"
          categories={last7DayLabels}
          chartType="area"
        />
        <KpiCard
          label="Açık Talepler"
          value={openRequestCount}
          hint="Henüz çözülmemiş"
          icon={<PaperPlaneIcon />}
          isLoading={requestsQ.isLoading}
          accent="warning"
          sparkline={requestSpark}
          sparklineLabel="Günlük yeni talep"
          categories={last7DayLabels}
          chartType="stepline"
        />
      </div>

      {/* Harita */}
      <div className="stagger-children mt-6">
        <DashboardMapWidget />
      </div>

      {/* Grafikler */}
      <div className="stagger-children mt-6">
        <DashboardCharts
          appointments={apptQ.data ?? []}
          storeCount={storeCount}
          freeBarberCount={freeBarberCount}
          suspendedStores={suspendedStores}
          suspendedFreeBarbers={suspendedFreeBarbers}
          complaints={complaintsQ.data ?? []}
          requests={requestsQ.data ?? []}
        />
      </div>

      {/* Alt bölüm: 3 eşit kolon */}
      <div className="stagger-children mt-6 grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
        {/* Kolon 1: Kullanıcı Tipi Dağılımı + 2 mini kart */}
        <div className="flex flex-col gap-4">
          <UserTypeBreakdown />

          {/* Randevu Özeti */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
              Randevu Özeti
            </h3>
            {apptQ.isLoading ? (
              <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.03]" />
            ) : (
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/[0.06]">
                <div className="flex flex-col items-center gap-0.5 px-2 text-center">
                  <AnimatedNumber value={todayAppointments} className="text-xl font-bold text-blue-500 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Bugün</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-2 text-center">
                  <AnimatedNumber value={pendingAppointments} className="text-xl font-bold text-warning-500 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Bekleyen</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 px-2 text-center">
                  <AnimatedNumber value={completedAppointments} className="text-xl font-bold text-success-500 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Tamamlanan</span>
                </div>
              </div>
            )}
          </div>

          {/* Platform Genel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
              Platform Geneli
            </h3>
            {isPlatformLoading ? (
              <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.03]" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-brand-50/60 py-3 text-center dark:bg-brand-500/5">
                  <AnimatedNumber value={storeCount - suspendedStores} className="text-xl font-bold text-brand-500 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Aktif Salon</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-success-50/60 py-3 text-center dark:bg-success-500/5">
                  <AnimatedNumber value={freeBarberCount - suspendedFreeBarbers} className="text-xl font-bold text-success-500 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Aktif Berber</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-blue-50/60 py-3 text-center dark:bg-blue-500/5">
                  <AnimatedNumber value={customerCount} className="text-xl font-bold text-blue-500 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Müşteri</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 py-3 text-center dark:bg-white/[0.03]">
                  <AnimatedNumber value={userCount - bannedCount} className="text-xl font-bold text-gray-700 dark:text-gray-200 tabular-nums" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Aktif Kullanıcı</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Son Kayıtlı Kullanıcılar */}
        <DashboardRecentUsers
          users={usersQ.data ?? []}
          isLoading={usersQ.isLoading}
        />

        {/* Platform Özeti */}
        <DashboardPlatformOverview
          storeCount={storeCount}
          freeBarberCount={freeBarberCount}
          completedAppointments={completedAppointments}
          complaintCount={complaintsQ.data?.length ?? 0}
          unresolvedComplaints={unresolvedComplaints}
          openRequestCount={openRequestCount}
          bannedCount={bannedCount}
          suspendedStores={suspendedStores}
          suspendedFreeBarbers={suspendedFreeBarbers}
          isLoading={isPlatformLoading}
        />
      </div>
    </>
  );
}
