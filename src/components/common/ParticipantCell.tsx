import UserAvatar from "./UserAvatar";
import { userTypeLabels } from "../../features/users/userTypeLabels";
import type { UserType } from "../../features/users/usersApi";

export function formatEntityNumber(n?: string | null) {
  if (!n) return null;
  return n.startsWith("#") ? n : `#${n}`;
}

interface ParticipantCellProps {
  name?: string | null;
  imageUrl?: string | null;
  userType?: UserType | null;
  typeLabel?: string | null;
  number?: string | null;
}

export default function ParticipantCell({
  name,
  imageUrl,
  userType,
  typeLabel,
  number,
}: ParticipantCellProps) {
  const label = typeLabel ?? (userType != null ? userTypeLabels[userType] : null);
  const displayName = name?.trim() || "Bilinmiyor";
  const parts = displayName.split(" ");

  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        firstName={parts[0]}
        lastName={parts.slice(1).join(" ")}
        imageUrl={imageUrl ?? undefined}
        size={32}
      />
      <div className="flex flex-col leading-tight">
        <span className="text-sm text-gray-800 dark:text-white/90">{displayName}</span>
        {(label || number) && (
          <div className="flex flex-wrap items-center gap-x-2">
            {label ? (
              <span className="text-[10px] uppercase text-gray-400">{label}</span>
            ) : null}
            {number ? (
              <span className="text-xs font-medium text-brand-500/80 dark:text-brand-400/80">
                {formatEntityNumber(number)}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
