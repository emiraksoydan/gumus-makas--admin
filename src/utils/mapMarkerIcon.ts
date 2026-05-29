import L from "leaflet";

import { resolveMediaUrl } from "./mediaUrl";

import {

  MAP_MARKER_COLORS,

  type AdminMapMarker,

} from "./adminMapMarkers";



function escapeHtml(value: string): string {

  return value

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#39;");

}



function formatCode(code?: string): string | null {

  if (!code) return null;

  return code.startsWith("#") ? code : `#${code}`;

}



function truncateName(name: string, max = 14): string {

  const t = name.trim();

  if (t.length <= max) return t;

  return `${t.slice(0, max - 1)}…`;

}



export function createMapMarkerIcon(marker: AdminMapMarker): L.DivIcon {

  const color = MAP_MARKER_COLORS[marker.kind];

  const initial = (marker.title?.trim()?.[0] ?? "?").toUpperCase();

  const imageUrl = resolveMediaUrl(marker.imageUrl);

  const codeLabel = formatCode(marker.code);

  const displayName = truncateName(marker.title || "?");



  const avatarInner = imageUrl

    ? `<img src="${escapeHtml(imageUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${color};">${initial}</span>`

    : `<span style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${color};">${initial}</span>`;



  const codeBadge = codeLabel

    ? `<span style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:${color};color:#fff;font-size:8px;font-weight:600;line-height:1;padding:2px 5px;border-radius:6px;border:1.5px solid #fff;box-shadow:0 1px 4px rgba(15,23,42,.25);white-space:nowrap;z-index:2;">${escapeHtml(codeLabel)}</span>`

    : "";



  const nameLabel = `<span style="display:block;margin-top:2px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;font-weight:600;line-height:1.2;color:#1e293b;text-align:center;text-shadow:0 0 3px #fff,0 0 3px #fff;">${escapeHtml(displayName)}</span>`;



  const html = `

    <div style="position:relative;width:72px;text-align:center;">

      <div style="position:relative;width:40px;height:40px;margin:0 auto;border-radius:50%;border:2.5px solid ${color};background:#fff;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,.28);">

        ${avatarInner}

      </div>

      ${codeBadge}

      ${nameLabel}

    </div>

  `.trim();



  const height = codeLabel ? 68 : 58;



  return L.divIcon({

    className: "",

    html,

    iconSize: [72, height],

    iconAnchor: [36, height / 2],

    popupAnchor: [0, -height / 2 + 6],

  });

}


