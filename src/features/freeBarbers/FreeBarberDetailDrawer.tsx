import { useState } from "react";
import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import EntityDetailHero from "../../components/common/EntityDetailHero";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import DetailOfferingsList from "../../components/common/DetailOfferingsList";
import DetailPackagesList from "../../components/common/DetailPackagesList";
import DetailLabeledImage from "../../components/common/DetailLabeledImage";
import EntityReviewsList from "../../components/common/EntityReviewsList";
import Badge from "../../components/ui/badge/Badge";
import ActionButton from "../../components/common/ActionButton";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import { barberTypeLabel, fmtDateTime } from "../../utils/entityLabels";
import type { FreeBarberAdmin } from "./freeBarbersApi";
import { useSuspendFreeBarberMutation } from "./freeBarbersApi";

interface FreeBarberDetailDrawerProps {
  barber: FreeBarberAdmin | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeBarberDetailDrawer({
  barber,
  isOpen,
  onClose,
}: FreeBarberDetailDrawerProps) {
  barber = useRetained(barber);
  const [suspendReason, setSuspendReason] = useState("");
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendFreeBarber, { isLoading: isSuspending }] = useSuspendFreeBarberMutation();

  if (!barber) return null;

  const displayFirst = barber.firstName ?? barber.fullName?.split(" ")[0] ?? "—";
  const displayLast =
    barber.lastName ?? barber.fullName?.split(" ").slice(1).join(" ") ?? "—";

  const handleSuspend = async (suspend: boolean) => {
    if (!barber) return;
    await suspendFreeBarber({ id: barber.id, suspend, reason: suspendReason || undefined });
    setShowSuspendForm(false);
    setSuspendReason("");
    onClose();
  };

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={barber.fullName}
      subtitle={formatEntityNumber(barber.customerNumber) ?? "Serbest berber"}
      widthClass="max-w-2xl"
      header={
        <>
          <EntityDetailHero name={barber.fullName} imageList={barber.imageList} />
          <DetailLabeledImage
            label="Berber sertifikası"
            imageUrl={barber.barberCertificateImage?.imageUrl}
          />
          <DetailLabeledImage
            label="Güzellik uzmanı sertifikası"
            imageUrl={barber.beautySalonCertificateImage?.imageUrl}
          />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Durum"
          value={
            barber.isSuspended ? (
              <Badge size="sm" color="error">Askıda</Badge>
            ) : barber.isAvailable ? (
              <Badge size="sm" color="success">Müsait</Badge>
            ) : (
              <Badge size="sm" color="warning">Meşgul</Badge>
            )
          }
        />
        {barber.isSuspended && barber.suspendReason && (
          <DetailInfoBox label="Askı Nedeni" value={barber.suspendReason} className="sm:col-span-2" />
        )}
        {barber.customerNumber && (
          <DetailInfoBox label="Berber No" value={formatEntityNumber(barber.customerNumber)} />
        )}
        <DetailInfoBox label="Ad" value={displayFirst} />
        <DetailInfoBox label="Soyad" value={displayLast || "—"} />
        <DetailInfoBox label="İşletme tipi" value={barberTypeLabel(barber.type)} />
        <DetailInfoBox
          label="Konum"
          value={`${barber.latitude.toFixed(5)}, ${barber.longitude.toFixed(5)}`}
        />
        <DetailInfoBox
          label="Puan"
          value={`⭐ ${(barber.rating ?? 0).toFixed(1)} (${barber.reviewCount ?? 0} değerlendirme)`}
        />
        <DetailInfoBox label="Favori" value={String(barber.favoriteCount ?? 0)} />
        <DetailInfoBox label="Oluşturulma" value={fmtDateTime(barber.createdAt)} />
        <DetailInfoBox label="Güncellenme" value={fmtDateTime(barber.updatedAt)} />
        <DetailInfoBox label="Kullanıcı ID" value={barber.freeBarberUserId} />
        <DetailInfoBox label="Panel ID" value={barber.id} />
      </div>
      <DetailOfferingsList offerings={barber.offerings ?? []} />
      <DetailPackagesList packages={barber.servicePackages ?? []} />
      <EntityReviewsList targetId={barber.freeBarberUserId} title="Berbere Yapılan Yorumlar" />

      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
        {barber.isSuspended ? (
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
