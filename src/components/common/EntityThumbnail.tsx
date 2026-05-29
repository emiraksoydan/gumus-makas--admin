import UserAvatar from "./UserAvatar";
import { imageUrlsFromList } from "../../utils/entityImages";
import { resolveMediaUrl } from "../../utils/mediaUrl";

interface EntityThumbnailProps {
  name: string;
  imageUrl?: string | null;
  imageList?: { imageUrl?: string | null }[] | null;
  size?: number;
  subtitle?: string | null;
  rounded?: "full" | "lg";
}

export default function EntityThumbnail({
  name,
  imageUrl,
  imageList,
  size = 40,
  subtitle,
  rounded = "full",
}: EntityThumbnailProps) {
  const parts = name.trim().split(" ");
  const resolved =
    resolveMediaUrl(imageUrl) ?? imageUrlsFromList(imageList)[0];
  const roundClass = rounded === "full" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex items-center gap-3">
      {resolved ? (
        <img
          src={resolved}
          alt={name}
          className={`object-cover ${roundClass}`}
          style={{ width: size, height: size }}
        />
      ) : (
        <UserAvatar
          firstName={parts[0]}
          lastName={parts.slice(1).join(" ")}
          size={size}
        />
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium text-gray-800 dark:text-white/90">
          {name}
        </span>
        {subtitle ? (
          <span className="truncate text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}
