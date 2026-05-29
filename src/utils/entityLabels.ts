/** BarberType — mobil ile aynı enum */
export function barberTypeLabel(type?: number | null): string {
  switch (type) {
    case 0:
      return "Erkek berber";
    case 1:
      return "Kadın berber";
    case 2:
      return "Güzellik salonu";
    default:
      return type != null ? String(type) : "—";
  }
}

export function pricingTypeLabel(pricingType?: string | null): string {
  if (!pricingType) return "—";
  const n = pricingType.toLowerCase();
  if (n === "percent" || n === "0") return "Yüzde payı";
  if (n === "rent" || n === "1") return "Kira";
  return pricingType;
}

const DAY_NAMES_TR = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

export function dayOfWeekLabel(day?: number | null): string {
  if (day == null || day < 0 || day > 6) return "—";
  return DAY_NAMES_TR[day] ?? String(day);
}

export function formatTimeSpan(value?: string | null): string {
  if (!value) return "—";
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;
  return value;
}

export function fmtDateTime(iso?: string | null): string {
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
