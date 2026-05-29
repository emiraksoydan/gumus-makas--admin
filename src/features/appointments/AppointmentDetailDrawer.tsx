import { useState } from "react";
import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import ActionButton from "../../components/common/ActionButton";
import ImageCarousel from "../../components/common/ImageCarousel";
import DetailOfferingsList from "../../components/common/DetailOfferingsList";
import DetailPackagesList from "../../components/common/DetailPackagesList";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import { collectImageUrls } from "../../utils/entityImages";
import {
  AppointmentStatus,
  appointmentStatusBadgeColor,
  appointmentStatusLabels,
  type AdminAppointment,
  useAdminCancelAppointmentMutation,
} from "./appointmentsApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return "—"; }
}

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
  if (/^\d{2}:\d{2}/.test(iso)) return iso.slice(0, 5);
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

interface AppointmentDetailDrawerProps {
  appointment: AdminAppointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentDetailDrawer({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailDrawerProps) {
  appointment = useRetained(appointment);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [adminCancel, { isLoading: isCancelling }] = useAdminCancelAppointmentMutation();

  if (!appointment) return null;

  const canCancel =
    appointment.status === AppointmentStatus.Pending ||
    appointment.status === AppointmentStatus.Approved;

  const handleCancel = async () => {
    if (!appointment) return;
    await adminCancel({ id: appointment.id, reason: cancelReason || undefined });
    setShowCancelForm(false);
    setCancelReason("");
    onClose();
  };

  const gallery = collectImageUrls(
    appointment.customerImage,
    appointment.storeImage,
    appointment.freeBarberImage,
    appointment.manuelBarberImage,
  );

  const providerName =
    appointment.storeName ??
    appointment.freeBarberName ??
    appointment.manuelBarberName ??
    "—";

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Randevu — ${fmtDate(appointment.appointmentDate)}`}
      subtitle={appointmentStatusLabels[appointment.status]}
      widthClass="max-w-2xl"
      header={gallery.length > 0 ? <ImageCarousel images={gallery} alt="Randevu" className="mb-5" /> : undefined}
    >
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Durum"
          value={
            <Badge size="sm" color={appointmentStatusBadgeColor[appointment.status]}>
              {appointmentStatusLabels[appointment.status]}
            </Badge>
          }
        />
        <DetailInfoBox label="Toplam Tutar" value={`${Number(appointment.totalPrice).toLocaleString("tr-TR")} ₺`} />
        <DetailInfoBox label="Tarih" value={fmtDate(appointment.appointmentDate)} />
        <DetailInfoBox
          label="Saat"
          value={`${fmtTime(appointment.startTime)}${appointment.endTime ? ` – ${fmtTime(appointment.endTime)}` : ""}`}
        />
        <DetailInfoBox label="Oluşturulma" value={fmtDate(appointment.createdAt)} />
        {appointment.chairName && (
          <DetailInfoBox label="Koltuk" value={appointment.chairName} />
        )}
      </div>

      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Katılımcılar
      </p>
      <div className="mb-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/[0.05] dark:bg-white/[0.02]">
        {appointment.customerName && (
          <div>
            <p className="mb-1 text-[10px] uppercase text-gray-400">Müşteri</p>
            <ParticipantCell
              name={appointment.customerName}
              imageUrl={appointment.customerImage}
              number={appointment.customerNumber}
            />
          </div>
        )}
        <div>
          <p className="mb-1 text-[10px] uppercase text-gray-400">Hizmet Veren</p>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">{providerName}</span>
          {appointment.storeNo && (
            <p className="text-xs text-brand-500">{formatEntityNumber(appointment.storeNo)}</p>
          )}
          {appointment.freeBarberNumber && (
            <p className="text-xs text-brand-500">{formatEntityNumber(appointment.freeBarberNumber)}</p>
          )}
        </div>
      </div>

      {(appointment.services?.length ?? 0) > 0 && (
        <DetailOfferingsList
          title={`Randevu hizmetleri (${appointment.services!.length})`}
          offerings={appointment.services!.map((s) => ({
            id: s.serviceId,
            serviceName: s.serviceName,
            price: s.price,
          }))}
        />
      )}

      {(appointment.packages?.length ?? 0) > 0 && (
        <DetailPackagesList
          title={`Randevu paketleri (${appointment.packages!.length})`}
          packages={appointment.packages!.map((p) => ({
            id: p.packageId,
            packageName: p.packageName,
            totalPrice: p.totalPrice,
            serviceNamesSnapshot: p.serviceNamesSnapshot,
          }))}
        />
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {appointment.requestLatitude != null && appointment.requestLongitude != null && (
          <DetailInfoBox
            label="Talep Konumu"
            value={`${appointment.requestLatitude.toFixed(5)}, ${appointment.requestLongitude.toFixed(5)}`}
            className="sm:col-span-2"
          />
        )}
        <DetailInfoBox label="Randevu ID" value={appointment.id} className="sm:col-span-2" />
      </div>

      {canCancel && (
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          {!showCancelForm ? (
            <ActionButton tone="danger" variant="soft" onClick={() => setShowCancelForm(true)}>
              Randevuyu İptal Et
            </ActionButton>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                İptal nedenini girin (opsiyonel)
              </p>
              <textarea
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200"
                rows={3}
                placeholder="Neden iptal ediyorsunuz?"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <ActionButton tone="danger" variant="solid" onClick={handleCancel} disabled={isCancelling}>
                  {isCancelling ? "İptal ediliyor..." : "Onayla ve İptal Et"}
                </ActionButton>
                <ActionButton tone="neutral" variant="outline" onClick={() => { setShowCancelForm(false); setCancelReason(""); }}>
                  Vazgeç
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      )}
    </EntityDetailDrawer>
  );
}
