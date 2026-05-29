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
    <div className="mb-5 flex justify-center rounded-2xl border border-gray-100 bg-gray-50/80 py-8 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <UserAvatar
        firstName={parts[0]}
        lastName={parts.slice(1).join(" ")}
        size={88}
      />
    </div>
  );
}
