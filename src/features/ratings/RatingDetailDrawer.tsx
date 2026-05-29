import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import ImageCarousel from "../../components/common/ImageCarousel";
import Button from "../../components/ui/button/Button";
import { collectImageUrls } from "../../utils/entityImages";
import type { AdminRating } from "./ratingsApi";
import { useDeleteRatingMutation } from "./ratingsApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

function Stars({ score }: { score: number }) {
  const full = Math.floor(score);
  return (
    <span className="text-warning-500 text-lg">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{score.toFixed(1)}</span>
    </span>
  );
}

export default function RatingDetailDrawer({
  rating,
  isOpen,
  onClose,
}: {
  rating: AdminRating | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  rating = useRetained(rating);
  const [deleteRating, { isLoading: isDeleting }] = useDeleteRatingMutation();

  if (!rating) return null;

  const handleDelete = async () => {
    if (!rating) return;
    await deleteRating(rating.id);
    onClose();
  };

  const images = collectImageUrls(rating.ratedFromImage, rating.targetImage);

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Değerlendirme"
      subtitle={fmtDate(rating.createdAt)}
      widthClass="max-w-2xl"
      header={images.length > 0 ? <ImageCarousel images={images} alt="Değerlendirme" className="mb-5" /> : undefined}
    >
      <div className="mb-4 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Değerlendiren
          </p>
          <ParticipantCell
            name={rating.ratedFromName}
            imageUrl={rating.ratedFromImage}
            userType={rating.ratedFromUserType}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Değerlendirilen
          </p>
          <ParticipantCell
            name={rating.targetName}
            imageUrl={rating.targetImage}
            typeLabel={rating.targetTypeLabel}
            number={rating.targetNumber}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox label="Puan" value={<Stars score={rating.score} />} />
        <DetailInfoBox label="Güncellenme" value={fmtDate(rating.updatedAt)} />
        <DetailInfoBox
          label="Yorum"
          value={
            <span className="whitespace-pre-wrap font-normal">{rating.comment ?? "—"}</span>
          }
          className="sm:col-span-2"
        />
        <DetailInfoBox label="Randevu ID" value={rating.appointmentId} />
        <DetailInfoBox label="Değerlendirme ID" value={rating.id} />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
        <Button size="sm" variant="outline" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? "Siliniyor..." : "Değerlendirmeyi Sil"}
        </Button>
      </div>
    </EntityDetailDrawer>
  );
}
