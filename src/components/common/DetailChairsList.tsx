import Badge from "../ui/badge/Badge";
import CellWithIcon from "./CellWithIcon";
import DetailSectionTitle from "./DetailSectionTitle";

export interface ChairListItem {
  id?: string;
  name?: string | null;
  manuelBarberName?: string | null;
  isAvailable?: boolean | null;
}

export default function DetailChairsList({ chairs }: { chairs: ChairListItem[] }) {
  if (!chairs.length) return null;

  return (
    <div>
      <DetailSectionTitle icon="chair" title="Koltuklar" count={chairs.length} />
      <ul className="space-y-2">
        {chairs.map((c, i) => (
          <li
            key={c.id ?? i}
            className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.03]"
          >
            <CellWithIcon icon="chair">
              <span className="font-medium text-gray-800 dark:text-white/90">
                {c.name ?? "İsimsiz koltuk"}
              </span>
            </CellWithIcon>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-6">
              {c.manuelBarberName ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {c.manuelBarberName}
                </span>
              ) : (
                <span className="text-xs text-gray-400">Manuel berber atanmadı</span>
              )}
              {c.isAvailable != null &&
                (c.isAvailable ? (
                  <Badge size="sm" color="success">Müsait</Badge>
                ) : (
                  <Badge size="sm" color="warning">Dolu</Badge>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
