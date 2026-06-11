import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BadgeTabs from "../../components/common/BadgeTabs";
import Label from "../../components/form/Label";
import AppIcon from "../../components/icons/AppIcon";
import AppointmentCalendarView from "../../components/calendar/AppointmentCalendarView";
import { useGetBarberStoresQuery } from "../../features/barberStores/barberStoresApi";
import { useGetFreeBarbersQuery } from "../../features/freeBarbers/freeBarbersApi";

type OwnerTab = "store" | "freebarber";

export default function AppointmentSchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramType = searchParams.get("type") as OwnerTab | null;
  // Geriye uyumlu: tekil ?id= (dükkan/serbest berber sayfasından gelen link) veya çoklu ?ids=a,b,c
  const paramIds = searchParams.get("ids");
  const paramId = searchParams.get("id");

  const initialIds = (paramIds ?? paramId ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const [tab, setTab] = useState<OwnerTab>(
    paramType === "freebarber" ? "freebarber" : "store",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [open, setOpen] = useState(false);

  const { data: stores = [] } = useGetBarberStoresQuery();
  const { data: freeBarbers = [] } = useGetFreeBarbersQuery();

  useEffect(() => {
    if (paramType === "store" || paramType === "freebarber") setTab(paramType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramType]);

  const options = useMemo(() => {
    if (tab === "store") {
      return stores.map((s) => ({
        id: s.id,
        label: s.storeName + (s.storeNo ? ` (#${s.storeNo})` : ""),
      }));
    }
    return freeBarbers.map((f) => ({
      id: f.id,
      label: f.fullName + (f.customerNumber ? ` (#${f.customerNumber})` : ""),
    }));
  }, [tab, stores, freeBarbers]);

  // Seçili id'lerden, mevcut sekmede olmayanları temizle
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => options.some((o) => o.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, options.length]);

  const syncUrl = (nextTab: OwnerTab, ids: string[]) => {
    const p = new URLSearchParams();
    p.set("type", nextTab);
    if (ids.length > 0) p.set("ids", ids.join(","));
    setSearchParams(p, { replace: true });
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      syncUrl(tab, next);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds([]);
    syncUrl(tab, []);
  };

  const allSelected = selectedIds.length === 0;
  const summary = allSelected
    ? "Tümü"
    : selectedIds.length === 1
      ? options.find((o) => o.id === selectedIds[0])?.label ?? "1 seçili"
      : `${selectedIds.length} seçili`;

  const calendarLabel = allSelected
    ? tab === "store" ? "Tüm salonlar" : "Tüm serbest berberler"
    : summary;

  return (
    <>
      <PageMeta title="Randevu Takvimi | Gümüş Makas Admin" description="Haftalık randevu takvimi" />
      <PageBreadcrumb pageTitle="Randevu Takvimi" />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <BadgeTabs<OwnerTab>
          tabs={[
            { id: "store", label: "Berber Dükkanı", badge: stores.length },
            { id: "freebarber", label: "Serbest Berber", badge: freeBarbers.length },
          ]}
          active={tab}
          onChange={(t) => {
            setTab(t);
            setSelectedIds([]);
            setOpen(false);
            syncUrl(t, []);
          }}
        />

        <div className="border-b border-gray-100 p-4 dark:border-white/[0.05] sm:p-6">
          <Label>
            {tab === "store" ? "Salon(lar) seçin" : "Serbest berber(ler) seçin"}
          </Label>

          <div className="relative mt-1.5 max-w-xl">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
            >
              <span className="truncate">
                {options.length === 0 ? "Kayıt bulunamadı" : summary}
              </span>
              <AppIcon
                name="chevronDown"
                className={`size-5 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && options.length > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <button
                    type="button"
                    onClick={selectAll}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-white/[0.05] ${
                      allSelected ? "text-brand-600 dark:text-brand-400" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span className={`flex size-4 items-center justify-center rounded border ${allSelected ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 dark:border-gray-600"}`}>
                      {allSelected && <AppIcon name="check" className="size-3" />}
                    </span>
                    <span className="font-medium">Tümü</span>
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-white/[0.06]" />
                  {options.map((o) => {
                    const checked = selectedIds.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => toggleId(o.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.05]"
                      >
                        <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${checked ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300 dark:border-gray-600"}`}>
                          {checked && <AppIcon name="check" className="size-3" />}
                        </span>
                        <span className="truncate">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {!allSelected && (
            <button
              type="button"
              onClick={selectAll}
              className="mt-2 text-xs text-brand-500 hover:underline"
            >
              Seçimi temizle (tümünü göster)
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {options.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              {tab === "store" ? "Salon" : "Serbest berber"} kaydı bulunamadı.
            </p>
          ) : (
            <AppointmentCalendarView
              ownerType={tab}
              ownerIds={selectedIds}
              ownerLabel={calendarLabel}
            />
          )}
        </div>
      </div>
    </>
  );
}
