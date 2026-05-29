import { useMemo } from "react";
import type { AdminAppointment } from "../features/appointments/appointmentsApi";
import type { BarberStore } from "../features/barberStores/barberStoresApi";
import type { FreeBarberAdmin } from "../features/freeBarbers/freeBarbersApi";

export type MapMarkerKind = "store" | "freeBarber" | "customer";

export interface AdminMapMarker {
  id: string;
  kind: MapMarkerKind;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  code?: string;
  payload: BarberStore | FreeBarberAdmin | AdminAppointment;
}

function isValidCoord(lat?: number | null, lng?: number | null) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function buildAdminMapMarkers(
  stores: BarberStore[] = [],
  freeBarbers: FreeBarberAdmin[] = [],
  appointments: AdminAppointment[] = [],
): AdminMapMarker[] {
  const markers: AdminMapMarker[] = [];
  const customerSeen = new Set<string>();

  for (const store of stores) {
    if (!isValidCoord(store.latitude, store.longitude)) continue;
    markers.push({
      id: `store-${store.id}`,
      kind: "store",
      lat: store.latitude!,
      lng: store.longitude!,
      title: store.storeName,
      subtitle: store.addressDescription ?? undefined,
      imageUrl: store.imageList?.[0]?.imageUrl,
      code: store.storeNo ?? undefined,
      payload: store,
    });
  }

  for (const fb of freeBarbers) {
    if (!isValidCoord(fb.latitude, fb.longitude)) continue;
    markers.push({
      id: `fb-${fb.id}`,
      kind: "freeBarber",
      lat: fb.latitude,
      lng: fb.longitude,
      title: fb.fullName,
      subtitle: fb.isAvailable ? "Müsait" : "Meşgul",
      imageUrl: fb.imageList?.[0]?.imageUrl,
      code: fb.customerNumber ?? undefined,
      payload: fb,
    });
  }

  for (const appt of appointments) {
    if (!isValidCoord(appt.requestLatitude, appt.requestLongitude)) continue;
    const key = `${appt.requestLatitude},${appt.requestLongitude},${appt.customerUserId ?? appt.id}`;
    if (customerSeen.has(key)) continue;
    customerSeen.add(key);
    markers.push({
      id: `customer-${appt.id}`,
      kind: "customer",
      lat: appt.requestLatitude!,
      lng: appt.requestLongitude!,
      title: appt.customerName ?? "Müşteri",
      subtitle: appt.storeName ?? appt.freeBarberName ?? "Randevu konumu",
      imageUrl: appt.customerImage ?? undefined,
      code: appt.customerNumber ?? undefined,
      payload: appt,
    });
  }

  return markers;
}

export function useMapCenter(markers: AdminMapMarker[]) {
  return useMemo(() => {
    if (markers.length === 0) return { lat: 39.9255, lng: 32.8663, zoom: 6 };
    const lat =
      markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
    const lng =
      markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
    const zoom = markers.length === 1 ? 13 : markers.length < 5 ? 11 : 8;
    return { lat, lng, zoom };
  }, [markers]);
}

export const MAP_MARKER_COLORS: Record<MapMarkerKind, string> = {
  store: "#465fff",
  freeBarber: "#12b76a",
  customer: "#f79009",
};

export const MAP_MARKER_LABELS: Record<MapMarkerKind, string> = {
  store: "Berber Salonu",
  freeBarber: "Serbest Berber",
  customer: "Müşteri (Randevu)",
};
