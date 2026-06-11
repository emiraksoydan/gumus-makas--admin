import { useGetRatingsByTargetQuery } from "../../features/ratings/ratingsApi";
import ParticipantCell from "./ParticipantCell";
import DetailSectionTitle from "./DetailSectionTitle";

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Stars({ score }: { score: number }) {
  const full = Math.round(score);
  return (
    <span className="text-warning-500" title={`${score.toFixed(1)}`}>
      {"★".repeat(Math.min(5, full))}
      {"☆".repeat(Math.max(0, 5 - full))}
    </span>
  );
}

/**
 * Bir hedefe (salon id / serbest berber user id / manuel berber id / müşteri id)
 * yapılmış değerlendirmeleri yorumlarıyla listeler. Off-canvas içinde kullanılır.
 */
export default function EntityReviewsList({
  targetId,
  title = "Yorumlar",
}: {
  targetId: string | null | undefined;
  title?: string;
}) {
  const { data, isLoading, isFetching } = useGetRatingsByTargetQuery(targetId ?? "", {
    skip: !targetId,
  });

  const reviews = data ?? [];

  return (
    <div>
      <DetailSectionTitle
        icon="rating"
        title={title}
        count={reviews.length > 0 ? reviews.length : undefined}
      />

      {isLoading || isFetching ? (
        <p className="py-4 text-center text-xs text-gray-500">Yükleniyor...</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400 dark:border-gray-700">
          Henüz yorum yok.
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-gray-100 p-3 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-2">
                <ParticipantCell
                  name={r.ratedFromName}
                  imageUrl={r.ratedFromImage}
                  userType={r.ratedFromUserType}
                  number={r.ratedFromNumber}
                />
                <div className="flex flex-col items-end gap-0.5">
                  <Stars score={r.score} />
                  <span className="text-[10px] text-gray-400">{fmtDate(r.createdAt)}</span>
                </div>
              </div>
              {r.comment?.trim() ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {r.comment}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-gray-400">Yorum yazılmamış</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
