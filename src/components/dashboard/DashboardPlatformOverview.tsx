import { Link } from "react-router";

interface Stat {
  label: string;
  value: number;
  accent: string;
  to?: string;
  warn?: boolean;
}

interface Props {
  storeCount: number;
  freeBarberCount: number;
  completedAppointments: number;
  complaintCount: number;
  unresolvedComplaints: number;
  openRequestCount: number;
  bannedCount: number;
  suspendedStores: number;
  suspendedFreeBarbers: number;
  isLoading?: boolean;
}

export default function DashboardPlatformOverview({
  storeCount,
  freeBarberCount,
  completedAppointments,
  complaintCount,
  unresolvedComplaints,
  openRequestCount,
  bannedCount,
  suspendedStores,
  suspendedFreeBarbers,
  isLoading,
}: Props) {
  const items: Stat[] = [
    { label: "Berber Salonu", value: storeCount, accent: "text-brand-500", to: "/barberstores" },
    { label: "Serbest Berber", value: freeBarberCount, accent: "text-success-500", to: "/free-barbers" },
    { label: "Tamamlanan Randevu", value: completedAppointments, accent: "text-blue-500", to: "/appointments" },
    { label: "Toplam Şikayet", value: complaintCount, accent: "text-error-500", to: "/complaints" },
    { label: "Çözümsüz Şikayet", value: unresolvedComplaints, accent: "text-error-600", to: "/complaints", warn: unresolvedComplaints > 0 },
    { label: "Açık Talep", value: openRequestCount, accent: "text-warning-500", to: "/requests", warn: openRequestCount > 0 },
    { label: "Engelli Kullanıcı", value: bannedCount, accent: "text-error-500", to: "/users", warn: bannedCount > 0 },
    { label: "Askıdaki Salon", value: suspendedStores, accent: "text-warning-600", to: "/barberstores", warn: suspendedStores > 0 },
    { label: "Askıdaki Berber", value: suspendedFreeBarbers, accent: "text-warning-600", to: "/free-barbers", warn: suspendedFreeBarbers > 0 },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        Platform Özeti
      </h3>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.03]" />
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.label}>
              {item.to ? (
                <Link
                  to={item.to}
                  className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] ${
                    item.warn
                      ? "border-warning-200 bg-warning-50/60 dark:border-warning-500/20 dark:bg-warning-500/5"
                      : "border-gray-100 bg-gray-50/80 dark:border-white/[0.05] dark:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.accent}`}>{item.value}</span>
                </Link>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.accent}`}>{item.value}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
