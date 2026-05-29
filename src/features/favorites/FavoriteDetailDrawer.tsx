import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import ImageCarousel from "../../components/common/ImageCarousel";
import { collectImageUrls } from "../../utils/entityImages";
import { favoriteTargetTypeLabels, type AdminFavorite } from "./favoritesApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return "—"; }
}

export default function FavoriteDetailDrawer({
  favorite,
  isOpen,
  onClose,
}: {
  favorite: AdminFavorite | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  favorite = useRetained(favorite);
  if (!favorite) return null;

  const images = collectImageUrls(favorite.favoritedFromImage, favorite.targetImage);

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Favori Kaydı"
      subtitle={fmtDate(favorite.createdAt)}
      widthClass="max-w-2xl"
      header={images.length > 0 ? <ImageCarousel images={images} alt="Favori" className="mb-5" /> : undefined}
    >
      <div className="mb-4 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Favorileyen
          </p>
          <ParticipantCell
            name={favorite.favoritedFromName}
            imageUrl={favorite.favoritedFromImage}
            userType={favorite.favoritedFromUserType}
            number={favorite.favoritedFromCustomerNumber}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Favori Hedefi
          </p>
          <ParticipantCell
            name={favorite.targetName}
            imageUrl={favorite.targetImage}
            typeLabel={favoriteTargetTypeLabels[favorite.targetType]}
            number={favorite.targetNumber}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Hedef Türü"
          value={
            <Badge size="sm" color="info">
              {favoriteTargetTypeLabels[favorite.targetType]}
            </Badge>
          }
        />
        <DetailInfoBox label="Tarih" value={fmtDate(favorite.createdAt)} />
        <DetailInfoBox label="Kayıt ID" value={favorite.id} className="sm:col-span-2" />
      </div>
    </EntityDetailDrawer>
  );
}
