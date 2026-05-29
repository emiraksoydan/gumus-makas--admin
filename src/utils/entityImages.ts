import { resolveMediaUrl } from "./mediaUrl";

export function imageUrlsFromList(
  imageList?: { imageUrl?: string | null }[] | null,
): string[] {
  if (!imageList?.length) return [];
  return imageList
    .map((i) => resolveMediaUrl(i.imageUrl))
    .filter((u): u is string => Boolean(u));
}

export function collectImageUrls(
  ...sources: (string | null | undefined)[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of sources) {
    const url = resolveMediaUrl(s);
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}
