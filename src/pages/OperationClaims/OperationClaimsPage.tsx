import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { useGetOperationClaimsQuery } from "../../features/operationClaims/operationClaimsApi";

const ROLE_COLORS: Record<string, "primary" | "success" | "info" | "warning" | "error" | "light" | "dark"> = {
  Admin: "primary",
  Customer: "info",
  FreeBarber: "success",
  BarberStore: "warning",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Admin: "Yönetim paneli yetkisi. Tüm admin endpoint'lerini çağırabilir.",
  Customer: "Mobil uygulama müşteri rolü. Randevu oluşturma, favori, şikayet vb.",
  FreeBarber: "Bağımsız berber rolü. Müşterilere hizmet sunar, randevu kabul/red eder.",
  BarberStore: "Berber salonu rolü. Koltuk yönetir, hizmet tanımlar, randevu yönetir.",
};

export default function OperationClaimsPage() {
  const { data, isLoading, error, refetch } = useGetOperationClaimsQuery();
  const claims = data ?? [];

  return (
    <>
      <PageMeta title="Sistem Rolleri | Gümüş Makas Admin" description="Operation claims" />
      <PageBreadcrumb pageTitle="Sistem Rolleri" />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Roller yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
        <strong>Not:</strong> Sistem rolleri kodla referans verildiği için yeni rol eklenmesi
        uygulama davranışını değiştirmez. Bu sayfa salt-okunur bilgi amaçlıdır.
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></span>
            <span className="ml-2">Yükleniyor...</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Tanımlı sistem rolü yok.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {claims.map((c) => (
              <li key={c.id} className="flex items-start gap-4 px-5 py-4">
                <Badge size="md" color={ROLE_COLORS[c.name] ?? "info"}>
                  {c.name}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {ROLE_DESCRIPTIONS[c.name] ?? "Açıklama tanımlı değil."}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-gray-400">{c.id}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
