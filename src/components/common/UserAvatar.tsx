import { resolveMediaUrl } from "../../utils/mediaUrl";

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
}

const COLOR_PALETTE = [
  "bg-brand-500/15 text-brand-600 dark:text-brand-400",
  "bg-success-500/15 text-success-600 dark:text-success-400",
  "bg-warning-500/15 text-warning-600 dark:text-warning-400",
  "bg-error-500/15 text-error-600 dark:text-error-400",
  "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  "bg-pink-500/15 text-pink-600 dark:text-pink-400",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
];

function hashIndex(seed: string, mod: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % mod;
}

/**
 * Initial harf fallback avatar — image yoksa renkli yuvarlak içinde ad/soyad ilk harflerini gösterir.
 * Aynı kişi her sayfada aynı rengi alır (isim hash'i ile).
 */
export default function UserAvatar({
  firstName,
  lastName,
  imageUrl,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const fn = (firstName ?? "").trim();
  const ln = (lastName ?? "").trim();
  const initials =
    ((fn[0] ?? "") + (ln[0] ?? "")).toUpperCase() || (fn[0] ?? "?").toUpperCase();

  const resolvedUrl = resolveMediaUrl(imageUrl);

  if (resolvedUrl) {
    return (
      <div
        className={`overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={resolvedUrl}
          alt={`${fn} ${ln}`.trim() || "Kullanıcı"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const colorClass =
    COLOR_PALETTE[hashIndex(`${fn}${ln}`, COLOR_PALETTE.length)];

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold ${colorClass} ${className}`}
      style={{ width: size, height: size, fontSize: Math.floor(size * 0.4) }}
    >
      {initials}
    </div>
  );
}
