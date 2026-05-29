import { useMemo } from "react";
import { Link } from "react-router";
import AdminLocationMap from "../map/AdminLocationMap";
import { useGetBarberStoresQuery } from "../../features/barberStores/barberStoresApi";
import { useGetFreeBarbersQuery } from "../../features/freeBarbers/freeBarbersApi";
import { useGetAppointmentsQuery } from "../../features/appointments/appointmentsApi";
import { buildAdminMapMarkers } from "../../utils/adminMapMarkers";

export default function DashboardMapWidget() {
  const storesQ = useGetBarberStoresQuery();
  const freeBarbersQ = useGetFreeBarbersQuery();
  const appointmentsQ = useGetAppointmentsQuery();

  const markers = useMemo(
    () =>
      buildAdminMapMarkers(
        storesQ.data,
        freeBarbersQ.data,
        appointmentsQ.data,
      ),
    [storesQ.data, freeBarbersQ.data, appointmentsQ.data],
  );

  const isLoading = storesQ.isLoading || freeBarbersQ.isLoading || appointmentsQ.isLoading;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Konum Haritası
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Salon, serbest berber ve müşteri konumları
          </p>
        </div>
        <Link
          to="/map"
          className="text-sm font-medium text-brand-500 transition-all duration-500 ease-in-out hover:text-brand-600"
        >
          Tam ekran →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-[320px] items-center justify-center rounded-xl bg-gray-50 dark:bg-white/[0.02]">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
        </div>
      ) : (
        <AdminLocationMap markers={markers} height={320} showLegend />
      )}
    </div>
  );
}
