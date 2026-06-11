import UserAvatar from "./UserAvatar";
import ImageCarousel from "./ImageCarousel";
import { collectImageUrls, imageUrlsFromList } from "../../utils/entityImages";

interface EntityDetailHeroProps {
  name: string;
  imageUrl?: string | null;
  imageList?: { imageUrl?: string | null }[] | null;
  extraImages?: (string | null | undefined)[];
}

export default function EntityDetailHero({
  name,
  imageUrl,
  imageList,
  extraImages = [],
}: EntityDetailHeroProps) {
  const images = [
    ...imageUrlsFromList(imageList),
    ...collectImageUrls(imageUrl, ...extraImages),
  ];
  const unique = [...new Set(images)];

  if (unique.length > 0) {
    return <ImageCarousel images={unique} alt={name} className="mb-5" />;
  }

  const parts = name.trim().split(" ");
  return (
    <div className="mb-5 flex flex-col items-center gap-3 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-500/[0.07] to-white py-8 dark:border-brand-500/20 dark:from-brand-500/10 dark:to-white/[0.02]">
      <UserAvatar
        firstName={parts[0]}
        lastName={parts.slice(1).join(" ")}
        size={88}
      />
      <span className="max-w-[80%] truncate text-sm font-medium text-gray-700 dark:text-gray-300">
        {name}
      </span>
    </div>
  );
}
