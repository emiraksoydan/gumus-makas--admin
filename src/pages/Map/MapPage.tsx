import { useMemo, useState } from "react";

import { Link } from "react-router";

import PageMeta from "../../components/common/PageMeta";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import AdminLocationMap from "../../components/map/AdminLocationMap";

import MapMarkerDetailModal from "../../components/map/MapMarkerDetailModal";

import { useGetBarberStoresQuery } from "../../features/barberStores/barberStoresApi";

import { useGetFreeBarbersQuery } from "../../features/freeBarbers/freeBarbersApi";

import { useGetAppointmentsQuery } from "../../features/appointments/appointmentsApi";

import { buildAdminMapMarkers, type AdminMapMarker } from "../../utils/adminMapMarkers";



export default function MapPage() {

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



  const [selectedMarker, setSelectedMarker] = useState<AdminMapMarker | null>(null);



  const isLoading = storesQ.isLoading || freeBarbersQ.isLoading || appointmentsQ.isLoading;



  return (

    <>

      <PageMeta title="Harita | Gümüş Makas Admin" description="Salon, serbest berber ve müşteri konumları" />

      <PageBreadcrumb pageTitle="Harita" />



      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

        <p className="text-sm text-gray-500 dark:text-gray-400">

          Berber salonları, serbest berberler ve randevu talebinde konum paylaşan müşteriler.

          İşaretçiye tıklayarak detayları görüntüleyin.

        </p>

        <Link

          to="/barberstores"

          className="text-sm font-medium text-brand-500 transition-all duration-500 ease-in-out hover:text-brand-600"

        >

          Salon listesi →

        </Link>

      </div>



      {isLoading ? (

        <div className="flex h-[480px] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />

        </div>

      ) : (

        <AdminLocationMap

          markers={markers}

          height={520}

          onMarkerClick={setSelectedMarker}

        />

      )}



      <MapMarkerDetailModal

        marker={selectedMarker}

        onClose={() => setSelectedMarker(null)}

      />

    </>

  );

}


