import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function DetailLabeledImage({
  label,
  imageUrl,
}: {
  label: string;
  imageUrl?: string | null;
}) {
  if (!imageUrl) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/[0.05]">
        <img
          src={resolveMediaUrl(imageUrl)}
          alt={label}
          className="max-h-56 w-full object-cover"
        />
      </div>
    </div>
  );
}
