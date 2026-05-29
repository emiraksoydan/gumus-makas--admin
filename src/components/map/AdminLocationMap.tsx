import { useEffect } from "react";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import UserAvatar from "../common/UserAvatar";

import { formatEntityNumber } from "../common/ParticipantCell";

import {

  MAP_MARKER_COLORS,

  MAP_MARKER_LABELS,

  type AdminMapMarker,

  useMapCenter,

} from "../../utils/adminMapMarkers";

import { createMapMarkerIcon } from "../../utils/mapMarkerIcon";



function FitBounds({ markers }: { markers: AdminMapMarker[] }) {

  const map = useMap();

  useEffect(() => {

    if (markers.length === 0) return;

    if (markers.length === 1) {

      map.setView([markers[0].lat, markers[0].lng], 13);

      return;

    }

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });

  }, [map, markers]);

  return null;

}



function MarkerPopupContent({ marker }: { marker: AdminMapMarker }) {

  const nameParts = marker.title.trim().split(" ");



  return (

    <div className="min-w-[180px] text-sm">

      <div className="flex items-center gap-2.5">

        <UserAvatar

          firstName={nameParts[0]}

          lastName={nameParts.slice(1).join(" ")}

          imageUrl={marker.imageUrl}

          size={36}

        />

        <div className="min-w-0 flex-1">

          <p className="truncate font-semibold text-gray-900">{marker.title}</p>

          {marker.code && (

            <p className="text-xs font-semibold text-brand-500">

              {formatEntityNumber(marker.code)}

            </p>

          )}

        </div>

      </div>

      {marker.subtitle && (

        <p className="mt-2 text-xs text-gray-600">{marker.subtitle}</p>

      )}

      <p className="mt-1.5 text-[10px] uppercase tracking-wide text-gray-400">

        {MAP_MARKER_LABELS[marker.kind]}

      </p>

    </div>

  );

}



interface AdminLocationMapProps {

  markers: AdminMapMarker[];

  height?: number | string;

  className?: string;

  showLegend?: boolean;

  onMarkerClick?: (marker: AdminMapMarker) => void;

}



export default function AdminLocationMap({

  markers,

  height = 420,

  className = "",

  showLegend = true,

  onMarkerClick,

}: AdminLocationMapProps) {

  const center = useMapCenter(markers);



  return (

    <div className={`overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 ${className}`}>

      {showLegend && (

        <div className="flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs dark:border-white/[0.05] dark:bg-white/[0.02]">

          {(Object.keys(MAP_MARKER_LABELS) as (keyof typeof MAP_MARKER_LABELS)[]).map((kind) => (

            <span key={kind} className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">

              <span

                className="inline-block size-3 rounded-full border border-white shadow-sm"

                style={{ background: MAP_MARKER_COLORS[kind] }}

              />

              {MAP_MARKER_LABELS[kind]}

              <span className="text-gray-400">

                ({markers.filter((m) => m.kind === kind).length})

              </span>

            </span>

          ))}

        </div>

      )}

      <div style={{ height }} className="relative z-0">

        {markers.length === 0 ? (

          <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">

            Haritada gösterilecek konum bulunamadı.

          </div>

        ) : (

          <MapContainer

            center={[center.lat, center.lng]}

            zoom={center.zoom}

            scrollWheelZoom

            className="h-full w-full"

          >

            <TileLayer

              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />

            <FitBounds markers={markers} />

            {markers.map((m) => (

              <Marker

                key={m.id}

                position={[m.lat, m.lng]}

                icon={createMapMarkerIcon(m)}

                eventHandlers={

                  onMarkerClick

                    ? { click: () => onMarkerClick(m) }

                    : undefined

                }

              >

                {!onMarkerClick && (

                  <Popup>

                    <MarkerPopupContent marker={m} />

                  </Popup>

                )}

              </Marker>

            ))}

          </MapContainer>

        )}

      </div>

    </div>

  );

}


