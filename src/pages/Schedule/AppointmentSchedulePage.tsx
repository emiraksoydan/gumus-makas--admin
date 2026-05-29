import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BadgeTabs from "../../components/common/BadgeTabs";
import Label from "../../components/form/Label";
import AppointmentCalendarView from "../../components/calendar/AppointmentCalendarView";
import { useGetBarberStoresQuery } from "../../features/barberStores/barberStoresApi";
import { useGetFreeBarbersQuery } from "../../features/freeBarbers/freeBarbersApi";

type OwnerTab = "store" | "freebarber";

export default function AppointmentSchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramType = searchParams.get("type") as OwnerTab | null;
  const paramId = searchParams.get("id");

  const [tab, setTab] = useState<OwnerTab>(
    paramType === "freebarber" ? "freebarber" : "store",
  );
  const [selectedId, setSelectedId] = useState<string>(paramId ?? "");

  const { data: stores = [] } = useGetBarberStoresQuery();
  const { data: freeBarbers = [] } = useGetFreeBarbersQuery();

  useEffect(() => {
    if (paramType === "store" || paramType === "freebarber") setTab(paramType);
    if (paramId) setSelectedId(paramId);
  }, [paramType, paramId]);

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

  useEffect(() => {
    if (selectedId && options.some((o) => o.id === selectedId)) return;
    if (options.length > 0) setSelectedId(options[0].id);
    else setSelectedId("");
  }, [tab, options, selectedId]);

  const selectedLabel = options.find((o) => o.id === selectedId)?.label;

  const syncUrl = (nextTab: OwnerTab, id: string) => {
    const p = new URLSearchParams();
    p.set("type", nextTab);
    if (id) p.set("id", id);
    setSearchParams(p, { replace: true });
  };

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
            setSelectedId("");
            syncUrl(t, "");
          }}
        />

        <div className="border-b border-gray-100 p-4 dark:border-white/[0.05] sm:p-6">
          <Label>
            {tab === "store" ? "Salon seçin" : "Serbest berber seçin"}
          </Label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              syncUrl(tab, e.target.value);
            }}
            className="mt-1.5 h-11 w-full max-w-xl rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
          >
            {options.length === 0 ? (
              <option value="">Kayıt bulunamadı</option>
            ) : (
              options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="p-4 sm:p-6">
          {selectedId ? (
            <AppointmentCalendarView
              ownerType={tab}
              ownerId={selectedId}
              ownerLabel={selectedLabel}
            />
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">
              Takvimi görmek için {tab === "store" ? "bir salon" : "bir serbest berber"} seçin.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
