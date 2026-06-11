import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import EntityDetailHero from "../../components/common/EntityDetailHero";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import EntityReviewsList from "../../components/common/EntityReviewsList";
import type { ManuelBarber } from "./manuelBarbersApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return "—"; }
}

export default function ManuelBarberDetailDrawer({
  barber,
  isOpen,
  onClose,
}: {
  barber: ManuelBarber | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  barber = useRetained(barber);
  if (!barber) return null;

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={barber.fullName}
      subtitle={barber.ownerName ?? "Manuel berber"}
      widthClass="max-w-xl"
      header={
        <EntityDetailHero name={barber.fullName} imageUrl={barber.imageUrl} />
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Puan"
          value={`⭐ ${(barber.rating ?? 0).toFixed(1)} (${barber.reviewCount ?? 0})`}
        />
        {barber.ownerName && (
          <DetailInfoBox label="Salon Sahibi" value={barber.ownerName} />
        )}
        {barber.createdAt && (
          <DetailInfoBox label="Kayıt" value={fmtDate(barber.createdAt)} />
        )}
        {barber.ownerUserId && (
          <DetailInfoBox label="Sahip Kullanıcı ID" value={barber.ownerUserId} />
        )}
        <DetailInfoBox label="Berber ID" value={barber.id} className="sm:col-span-2" />
      </div>

      <EntityReviewsList targetId={barber.id} title="Berbere Yapılan Yorumlar" />
    </EntityDetailDrawer>
  );
}
