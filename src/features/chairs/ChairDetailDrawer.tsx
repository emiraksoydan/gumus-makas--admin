import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import Badge from "../../components/ui/badge/Badge";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import type { BarberChair } from "./chairsApi";

export default function ChairDetailDrawer({
  chair,
  isOpen,
  onClose,
}: {
  chair: BarberChair | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  chair = useRetained(chair);
  if (!chair) return null;

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={chair.name ?? "Koltuk"}
      subtitle={chair.storeName ?? undefined}
      widthClass="max-w-xl"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Müsaitlik"
          value={
            chair.isAvailable ? (
              <Badge size="sm" color="success">Müsait</Badge>
            ) : (
              <Badge size="sm" color="warning">Dolu</Badge>
            )
          }
        />
        <DetailInfoBox label="Salon" value={chair.storeName ?? "—"} />
        {chair.storeNo && (
          <DetailInfoBox label="Salon No" value={formatEntityNumber(chair.storeNo)} />
        )}
        <DetailInfoBox label="Manuel Berber" value={chair.manuelBarberName ?? "—"} />
        <DetailInfoBox label="Salon ID" value={chair.storeId} />
        <DetailInfoBox label="Koltuk ID" value={chair.id} />
      </div>
    </EntityDetailDrawer>
  );
}
