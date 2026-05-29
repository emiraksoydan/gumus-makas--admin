import UserAvatar from "./UserAvatar";
import CellWithIcon from "./CellWithIcon";

export interface ManuelBarberListItem {
  id?: string;
  fullName: string;
  profileImageUrl?: string | null;
  rating?: number;
}

export default function DetailManuelBarbersList({
  barbers,
}: {
  barbers: ManuelBarberListItem[];
}) {
  if (!barbers.length) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Manuel berberler ({barbers.length})
      </p>
      <ul className="space-y-2">
        {barbers.map((b, i) => {
          const parts = b.fullName.trim().split(" ");
          return (
            <li
              key={b.id ?? i}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  firstName={parts[0]}
                  lastName={parts.slice(1).join(" ")}
                  imageUrl={b.profileImageUrl ?? undefined}
                  size={36}
                />
                <CellWithIcon icon="manuelBarber">
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {b.fullName}
                  </span>
                </CellWithIcon>
              </div>
              <span className="shrink-0 text-sm text-gray-600 dark:text-gray-300">
                ⭐ {(b.rating ?? 0).toFixed(1)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
