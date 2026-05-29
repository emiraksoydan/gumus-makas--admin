import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import type { ServiceOffering } from "./serviceOfferingsApi";

export default function ServiceDetailDrawer({
  service,
  isOpen,
  onClose,
}: {
  service: ServiceOffering | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  service = useRetained(service);
  if (!service) return null;

  const name = service.name ?? service.serviceName ?? "Hizmet";

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={name}
      subtitle="Hizmet detayı"
      widthClass="max-w-xl"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox label="Hizmet Adı" value={name} className="sm:col-span-2" />
        <DetailInfoBox
          label="Fiyat"
          value={`${Number(service.price ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`}
        />
        {service.durationMinutes != null && (
          <DetailInfoBox label="Süre" value={`${service.durationMinutes} dk`} />
        )}
        {service.ownerName && (
          <DetailInfoBox label="Sahip" value={service.ownerName} />
        )}
        {service.categoryName && (
          <DetailInfoBox label="Kategori" value={service.categoryName} />
        )}
        {service.ownerId && (
          <DetailInfoBox label="Sahip ID" value={service.ownerId} />
        )}
        {service.description && (
          <DetailInfoBox label="Açıklama" value={service.description} className="sm:col-span-2" />
        )}
        {service.id && (
          <DetailInfoBox label="Hizmet ID" value={service.id} className="sm:col-span-2" />
        )}
      </div>
    </EntityDetailDrawer>
  );
}
