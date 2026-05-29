import { useState } from "react";
import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import EntityDetailHero from "../../components/common/EntityDetailHero";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import DetailOfferingsList from "../../components/common/DetailOfferingsList";
import DetailPackagesList from "../../components/common/DetailPackagesList";
import DetailLabeledImage from "../../components/common/DetailLabeledImage";
import DetailWorkingHoursList from "../../components/common/DetailWorkingHoursList";
import DetailChairsList from "../../components/common/DetailChairsList";
import DetailManuelBarbersList from "../../components/common/DetailManuelBarbersList";
import Badge from "../../components/ui/badge/Badge";
import ActionButton from "../../components/common/ActionButton";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import {
  barberTypeLabel,
  fmtDateTime,
  pricingTypeLabel,
} from "../../utils/entityLabels";
import type { BarberStore } from "./barberStoresApi";
import { useSuspendBarberStoreMutation } from "./barberStoresApi";

interface StoreDetailDrawerProps {
  store: BarberStore | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreDetailDrawer({ store, isOpen, onClose }: StoreDetailDrawerProps) {
  store = useRetained(store);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendStore, { isLoading: isSuspending }] = useSuspendBarberStoreMutation();

  if (!store) return null;

  const offerings = store.serviceOfferings ?? store.offerings ?? [];

  const handleSuspend = async (suspend: boolean) => {
    if (!store) return;
    await suspendStore({ id: store.id, suspend, reason: suspendReason || undefined });
    setShowSuspendForm(false);
    setSuspendReason("");
    onClose();
  };

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={store.storeName}
      subtitle={
        (store.storeNo ? formatEntityNumber(store.storeNo) : null) ??
        store.addressDescription ??
        undefined
      }
      widthClass="max-w-2xl"
      header={
        <>
          <EntityDetailHero name={store.storeName} imageList={store.imageList} />
          <DetailLabeledImage
            label="Vergi levhası / sertifika"
            imageUrl={store.taxDocumentImage?.imageUrl}
          />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Durum"
          value={
            store.isSuspended ? (
              <Badge size="sm" color="error">Askıda</Badge>
            ) : store.isOpenNow ? (
              <Badge size="sm" color="success">Açık</Badge>
            ) : (
              <Badge size="sm" color="warning">Kapalı</Badge>
            )
          }
        />
        {store.isSuspended && store.suspendReason && (
          <DetailInfoBox label="Askı Nedeni" value={store.suspendReason} className="sm:col-span-2" />
        )}
        {store.storeNo && (
          <DetailInfoBox label="Salon No" value={formatEntityNumber(store.storeNo)} />
        )}
        <DetailInfoBox label="İşletme tipi" value={barberTypeLabel(store.type)} />
        <DetailInfoBox
          label="Fiyatlandırma"
          value={`${pricingTypeLabel(store.pricingType)} — ${store.pricingValue}`}
        />
        <DetailInfoBox label="Adres" value={store.addressDescription ?? "—"} className="sm:col-span-2" />
        <DetailInfoBox
          label="Konum"
          value={
            store.latitude != null && store.longitude != null
              ? `${store.latitude.toFixed(5)}, ${store.longitude.toFixed(5)}`
              : "—"
          }
        />
        <DetailInfoBox
          label="Puan"
          value={`⭐ ${(store.rating ?? 0).toFixed(1)} (${store.reviewCount ?? 0} değerlendirme)`}
        />
        <DetailInfoBox label="Favori" value={String(store.favoriteCount ?? 0)} />
        <DetailInfoBox label="Koltuk sayısı" value={String(store.chairs?.length ?? 0)} />
        <DetailInfoBox label="Manuel berber" value={String(store.manuelBarbers?.length ?? 0)} />
        {store.barberStoreOwnerId && (
          <DetailInfoBox label="Sahip Kullanıcı ID" value={store.barberStoreOwnerId} />
        )}
        <DetailInfoBox label="Oluşturulma" value={fmtDateTime(store.createdAt)} />
        <DetailInfoBox label="Güncellenme" value={fmtDateTime(store.updatedAt)} />
        <DetailInfoBox label="Salon ID" value={store.id} className="sm:col-span-2" />
      </div>

      <DetailWorkingHoursList hours={store.workingHours ?? []} />
      <DetailChairsList chairs={store.chairs ?? []} />
      <DetailManuelBarbersList barbers={store.manuelBarbers ?? []} />
      <DetailOfferingsList offerings={offerings} />
      <DetailPackagesList packages={store.servicePackages ?? []} />

      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
        {store.isSuspended ? (
          <ActionButton tone="success" variant="soft" onClick={() => handleSuspend(false)} disabled={isSuspending}>
            {isSuspending ? "İşleniyor..." : "Askıyı Kaldır"}
          </ActionButton>
        ) : !showSuspendForm ? (
          <ActionButton tone="warning" variant="soft" onClick={() => setShowSuspendForm(true)}>
            Askıya Al
          </ActionButton>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Askıya alma nedeni (opsiyonel)
            </p>
            <textarea
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200"
              rows={3}
              placeholder="Neden askıya alıyorsunuz?"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
            />
            <div className="flex gap-2">
              <ActionButton tone="warning" variant="solid" onClick={() => handleSuspend(true)} disabled={isSuspending}>
                {isSuspending ? "İşleniyor..." : "Onayla ve Askıya Al"}
              </ActionButton>
              <ActionButton tone="neutral" variant="outline" onClick={() => { setShowSuspendForm(false); setSuspendReason(""); }}>
                Vazgeç
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </EntityDetailDrawer>
  );
}
