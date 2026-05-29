import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BadgeTabs from "../../components/common/BadgeTabs";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import AppIcon from "../../components/icons/AppIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AuditAction,
  ADMIN_AUDIT_ACTION_MIN,
  auditActionLabels,
  getAuditActionLabel,
  useGetAuditLogsQuery,
  type AuditLogScope,
} from "../../features/audit/auditApi";

interface FilterState {
  action?: AuditAction;
  fromUtc?: string;
  toUtc?: string;
  success?: boolean;
  page: number;
  pageSize: number;
}

const initialFilter: FilterState = { page: 1, pageSize: 25 };

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AuditLogsPage() {
  const [scopeTab, setScopeTab] = useState<AuditLogScope>("mobile");
  const [draft, setDraft] = useState<FilterState>(initialFilter);
  const [applied, setApplied] = useState<FilterState>(initialFilter);
  const [hideTokenRefresh, setHideTokenRefresh] = useState(true);

  const { data, isFetching, error, refetch } = useGetAuditLogsQuery({
    action: applied.action,
    fromUtc: applied.fromUtc ? new Date(applied.fromUtc).toISOString() : undefined,
    toUtc: applied.toUtc ? new Date(applied.toUtc).toISOString() : undefined,
    success: applied.success,
    scope: scopeTab,
    page: applied.page,
    pageSize: applied.pageSize,
  });

  const allItems = data?.items ?? [];
  // Token yenileme kayıtlarını gizle (varsayılan açık; yalnızca belirli aksiyon filtresi yokken uygulanır)
  const items =
    hideTokenRefresh && !applied.action
      ? allItems.filter((it) => it.action !== AuditAction.AuthRefreshSuccess)
      : allItems;
  const hiddenCount = allItems.length - items.length;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / applied.pageSize));

  const actionOptions = useMemo(() => {
    return Object.entries(AuditAction)
      .filter(
        ([k, v]) =>
          typeof v === "number" &&
          Number.isInteger(v) &&
          !Number.isNaN(Number(v)) &&
          /^[A-Z]/.test(k),
      )
      .map(([k, v]) => ({ value: v as number, key: k }))
      .filter((opt) =>
        scopeTab === "admin"
          ? opt.value >= ADMIN_AUDIT_ACTION_MIN
          : opt.value < ADMIN_AUDIT_ACTION_MIN,
      );
  }, [scopeTab]);

  const apply = () => setApplied({ ...draft, page: 1 });
  const clear = () => {
    setDraft(initialFilter);
    setApplied(initialFilter);
  };

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setApplied((s) => ({ ...s, page: newPage }));
  };

  const switchScope = (scope: AuditLogScope) => {
    setScopeTab(scope);
    setDraft((d) => ({ ...d, action: undefined, page: 1 }));
    setApplied((a) => ({ ...a, action: undefined, page: 1 }));
  };

  return (
    <>
      <PageMeta title="Denetim Kayıtları | Gümüş Makas Admin" description="Audit logs" />
      <PageBreadcrumb pageTitle="Denetim Kayıtları" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <BadgeTabs<AuditLogScope>
          tabs={[
            { id: "mobile", label: "Mobil Uygulama", badge: scopeTab === "mobile" ? total : undefined },
            { id: "admin", label: "Admin Panel", badge: scopeTab === "admin" ? total : undefined },
          ]}
          active={scopeTab}
          onChange={switchScope}
        />

        <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-white/[0.05] dark:text-gray-400 sm:px-5">
          {scopeTab === "mobile"
            ? "Kullanıcıların mobil uygulamadaki giriş, randevu, sohbet ve profil işlemleri."
            : "Yöneticilerin panel üzerinden yaptığı ban, kategori, admin ve denetim işlemleri."}
        </div>

        <div className="border-b border-gray-100 p-4 dark:border-white/[0.05] sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>Aksiyon</Label>
              <select
                value={draft.action ?? ""}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    action: e.target.value === "" ? undefined : (Number(e.target.value) as AuditAction),
                  }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
              >
                <option value="">Tümü</option>
                {actionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {auditActionLabels[opt.value as AuditAction] ?? opt.key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Başlangıç</Label>
              <Input
                type="datetime-local"
                value={draft.fromUtc ?? ""}
                onChange={(e) => setDraft((s) => ({ ...s, fromUtc: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label>Bitiş</Label>
              <Input
                type="datetime-local"
                value={draft.toUtc ?? ""}
                onChange={(e) => setDraft((s) => ({ ...s, toUtc: e.target.value || undefined }))}
              />
            </div>
            <div>
              <Label>Sonuç</Label>
              <select
                value={draft.success === undefined ? "" : String(draft.success)}
                onChange={(e) =>
                  setDraft((s) => ({
                    ...s,
                    success: e.target.value === "" ? undefined : e.target.value === "true",
                  }))
                }
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
              >
                <option value="">Tümü</option>
                <option value="true">Başarılı</option>
                <option value="false">Başarısız</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" onClick={apply}>
                Filtrele
              </Button>
              <Button size="sm" variant="outline" onClick={clear}>
                Temizle
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mx-4 mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
            Denetim kayıtları yüklenemedi.{" "}
            <button type="button" onClick={() => refetch()} className="ml-2 underline">
              Tekrar dene
            </button>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-white/[0.05]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Toplam <strong className="text-gray-700 dark:text-gray-300">{total}</strong> kayıt
              {hiddenCount > 0 && (
                <span className="ml-1 text-gray-400">
                  ({hiddenCount} token yenileme gizlendi)
                </span>
              )}
            </span>
            {/* Token yenileme toggle — yalnızca mobil sekmede geçerli */}
            {scopeTab === "mobile" && !applied.action && (
              <button
                type="button"
                onClick={() => setHideTokenRefresh((v) => !v)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                  hideTokenRefresh
                    ? "border-warning-300 bg-warning-50 text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400"
                    : "border-gray-300 bg-transparent text-gray-500 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                <AppIcon name="eye" className="size-3.5" />
                {hideTokenRefresh ? "Token yenilemeleri gizleniyor" : "Token yenilemeleri göster"}
              </button>
            )}
          </div>
          <select
            value={applied.pageSize}
            onChange={(e) => setApplied((s) => ({ ...s, pageSize: Number(e.target.value), page: 1 }))}
            className="h-8 rounded-lg border border-gray-300 bg-transparent px-2 text-xs text-gray-700 dark:border-gray-700 dark:text-white/80"
          >
            {[25, 50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>
                {n} / sayfa
              </option>
            ))}
          </select>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs uppercase text-gray-500 dark:text-gray-400">
                  Zaman
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs uppercase text-gray-500 dark:text-gray-400">
                  Aksiyon
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs uppercase text-gray-500 dark:text-gray-400">
                  Aktör
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs uppercase text-gray-500 dark:text-gray-400">
                  Hedef
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs uppercase text-gray-500 dark:text-gray-400">
                  Durum
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs uppercase text-gray-500 dark:text-gray-400">
                  IP
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isFetching && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="whitespace-nowrap px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                      {formatDate(it.occurredAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-theme-sm text-gray-800 dark:text-white/90">
                      {getAuditActionLabel(it.action, it.actionName)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-theme-sm text-gray-700 dark:text-gray-300">
                      {it.actorDisplayName ?? (
                        <span className="text-gray-400">Sistem / Anonim</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 font-mono text-theme-xs text-gray-500 dark:text-gray-400">
                      {it.resourceId ? `${it.resourceId.slice(0, 8)}…` : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-theme-sm">
                      {it.success ? (
                        <Badge size="sm" color="success">
                          Başarılı
                        </Badge>
                      ) : (
                        <Badge size="sm" color="error">
                          Başarısız
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-theme-xs text-gray-500 dark:text-gray-400">
                      {it.clientIp ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-white/[0.05]">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Sayfa {applied.page} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(applied.page - 1)}
              disabled={applied.page <= 1 || isFetching}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50 dark:border-gray-700"
            >
              <AppIcon name="chevronLeft" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goToPage(applied.page + 1)}
              disabled={applied.page >= totalPages || isFetching}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50 dark:border-gray-700"
            >
              <AppIcon name="chevronRight" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
