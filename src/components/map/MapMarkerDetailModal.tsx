import { type ReactNode } from "react";
import EntityDetailDrawer from "../common/EntityDetailDrawer";
import UserAvatar from "../common/UserAvatar";
import Badge from "../ui/badge/Badge";
import { formatEntityNumber } from "../common/ParticipantCell";
import {
  MAP_MARKER_LABELS,
  type AdminMapMarker,
} from "../../utils/adminMapMarkers";
import type { BarberStore } from "../../features/barberStores/barberStoresApi";
import type { FreeBarberAdmin } from "../../features/freeBarbers/freeBarbersApi";
import {
  AppointmentStatus,
  appointmentStatusLabels,
  type AdminAppointment,
} from "../../features/appointments/appointmentsApi";

interface MapMarkerDetailModalProps {
  marker: AdminMapMarker | null;
  onClose: () => void;
}

function InfoBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-800 dark:text-white/90">{value}</div>
    </div>
  );
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StoreContent({ store }: { store: BarberStore }) {
  const offerings =
    (store as BarberStore & { serviceOfferings?: { serviceName: string; price: number }[] })
      .serviceOfferings ??
    (store as BarberStore & { offerings?: { serviceName: string; price: number }[] }).offerings ??
    [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <InfoBox
        label="Durum"
        value={
          store.isOpenNow ? (
            <Badge size="sm" color="success">Açık</Badge>
          ) : (
            <Badge size="sm" color="warning">Kapalı</Badge>
          )
        }
      />
      {store.storeNo && (
        <InfoBox label="Salon No" value={formatEntityNumber(store.storeNo)} />
      )}
      <InfoBox label="Adres" value={store.addressDescription ?? "—"} />
      <InfoBox
        label="Konum"
        value={
          store.latitude != null && store.longitude != null
            ? `${store.latitude.toFixed(5)}, ${store.longitude.toFixed(5)}`
            : "—"
        }
      />
      <InfoBox
        label="Puan"
        value={`⭐ ${(store.rating ?? 0).toFixed(1)} (${store.reviewCount ?? 0} değerlendirme)`}
      />
      <InfoBox label="Favori" value={String(store.favoriteCount ?? 0)} />
      <InfoBox
        label="Fiyatlandırma"
        value={`${store.pricingType}: ${store.pricingValue}`}
      />
      {offerings.length > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Hizmetler ({offerings.length})
          </p>
          <ul className="space-y-2">
            {offerings.map((o, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <span>{o.serviceName}</span>
                <span className="font-medium">
                  {Number(o.price).toLocaleString("tr-TR")} ₺
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paketler */}
      {(store.servicePackages?.length ?? 0) > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Paketler ({store.servicePackages!.length})
          </p>
          <ul className="space-y-2">
            {store.servicePackages!.map((pkg) => (
              <li
                key={pkg.id}
                className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{pkg.packageName}</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {Number(pkg.totalPrice).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                {pkg.items && pkg.items.length > 0 && (
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {pkg.items.map((it) => it.serviceName).join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FreeBarberContent({ barber }: { barber: FreeBarberAdmin }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <InfoBox
        label="Müsaitlik"
        value={
          barber.isAvailable ? (
            <Badge size="sm" color="success">Müsait</Badge>
          ) : (
            <Badge size="sm" color="warning">Meşgul</Badge>
          )
        }
      />
      {barber.customerNumber && (
        <InfoBox label="Berber No" value={formatEntityNumber(barber.customerNumber)} />
      )}
      <InfoBox
        label="Konum"
        value={`${barber.latitude.toFixed(5)}, ${barber.longitude.toFixed(5)}`}
      />
      <InfoBox
        label="Puan"
        value={`⭐ ${(barber.rating ?? 0).toFixed(1)} (${barber.reviewCount ?? 0})`}
      />
      <InfoBox label="Favori" value={String(barber.favoriteCount ?? 0)} />

      {/* Hizmetler */}
      {(barber.offerings?.length ?? 0) > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Hizmetler ({barber.offerings!.length})
          </p>
          <ul className="space-y-2">
            {barber.offerings!.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 text-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <span>{o.serviceName}</span>
                <span className="font-medium">
                  {Number(o.price).toLocaleString("tr-TR")} ₺
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Paketler */}
      {(barber.servicePackages?.length ?? 0) > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Paketler ({barber.servicePackages!.length})
          </p>
          <ul className="space-y-2">
            {barber.servicePackages!.map((pkg) => (
              <li
                key={pkg.id}
                className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{pkg.packageName}</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    {Number(pkg.totalPrice).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                {pkg.items && pkg.items.length > 0 && (
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    {pkg.items.map((it) => it.serviceName).join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CustomerContent({ appt }: { appt: AdminAppointment }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {appt.customerNumber && (
        <InfoBox label="Müşteri No" value={formatEntityNumber(appt.customerNumber)} />
      )}
      <InfoBox
        label="Randevu Durumu"
        value={
          <Badge size="sm" color="info">
            {appointmentStatusLabels[appt.status as AppointmentStatus] ?? appt.status}
          </Badge>
        }
      />
      <InfoBox label="Salon" value={appt.storeName ?? "—"} />
      {appt.storeNo && (
        <InfoBox label="Salon No" value={formatEntityNumber(appt.storeNo)} />
      )}
      <InfoBox label="Serbest Berber" value={appt.freeBarberName ?? "—"} />
      {appt.freeBarberNumber && (
        <InfoBox label="Berber No" value={formatEntityNumber(appt.freeBarberNumber)} />
      )}
      <InfoBox label="Randevu Tarihi" value={fmtDate(appt.appointmentDate)} />
      <InfoBox
        label="Talep Konumu"
        value={
          appt.requestLatitude != null && appt.requestLongitude != null
            ? `${appt.requestLatitude.toFixed(5)}, ${appt.requestLongitude.toFixed(5)}`
            : "—"
        }
      />
    </div>
  );
}

export default function MapMarkerDetailModal({ marker, onClose }: MapMarkerDetailModalProps) {
  const nameParts = (marker?.title ?? "").trim().split(" ");
  const code = marker?.code ? formatEntityNumber(marker.code) : null;

  return (
    <EntityDetailDrawer
      isOpen={!!marker}
      onClose={onClose}
      title={marker?.title ?? ""}
      subtitle={marker ? MAP_MARKER_LABELS[marker.kind] : undefined}
      widthClass="max-w-xl"
      header={
        marker ? (
          <div className="mb-5 flex items-center gap-4">
            <UserAvatar
              firstName={nameParts[0]}
              lastName={nameParts.slice(1).join(" ")}
              imageUrl={marker.imageUrl ?? undefined}
              size={56}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm" color="primary">
                  {MAP_MARKER_LABELS[marker.kind]}
                </Badge>
              </div>
              {code && (
                <p className="mt-1 text-sm font-semibold text-brand-500 dark:text-brand-400">
                  {code}
                </p>
              )}
              {marker.subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {marker.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : null
      }
    >
      {marker?.kind === "store" && (
        <StoreContent store={marker.payload as BarberStore} />
      )}
      {marker?.kind === "freeBarber" && (
        <FreeBarberContent barber={marker.payload as FreeBarberAdmin} />
      )}
      {marker?.kind === "customer" && (
        <CustomerContent appt={marker.payload as AdminAppointment} />
      )}
    </EntityDetailDrawer>
  );
}
