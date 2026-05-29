import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import ActionButton from "../../components/common/ActionButton";
import type { AdminComplaint } from "./complaintsApi";
import { useResolveComplaintMutation } from "./complaintsApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function ComplaintDetailDrawer({
  complaint,
  isOpen,
  onClose,
}: {
  complaint: AdminComplaint | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  complaint = useRetained(complaint);
  const [resolveComplaint, { isLoading: isResolving }] = useResolveComplaintMutation();

  if (!complaint) return null;

  const handleResolve = async () => {
    if (!complaint) return;
    await resolveComplaint(complaint.id);
  };

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Şikayet Detayı"
      subtitle={fmtDate(complaint.createdAt)}
      widthClass="max-w-2xl"
    >
      <div className="mb-4 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Şikayet Eden
          </p>
          <ParticipantCell
            name={complaint.complaintFromUserName}
            imageUrl={complaint.complaintFromUserImage}
            userType={complaint.complaintFromUserType}
            number={complaint.complaintFromCustomerNumber}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Şikayet Edilen
          </p>
          <ParticipantCell
            name={complaint.targetUserName}
            imageUrl={complaint.targetUserImage}
            userType={complaint.targetUserType}
            number={complaint.targetCustomerNumber}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Durum"
          value={
            complaint.isResolved ? (
              <Badge size="sm" color="success">Çözümlendi</Badge>
            ) : (
              <Badge size="sm" color="warning">Açık</Badge>
            )
          }
        />
        <DetailInfoBox label="Tarih" value={fmtDate(complaint.createdAt)} />
        <DetailInfoBox
          label="Şikayet Metni"
          value={
            <span className="whitespace-pre-wrap font-normal">{complaint.complaintReason}</span>
          }
          className="sm:col-span-2"
        />
        {complaint.isResolved && (
          <DetailInfoBox
            label="Çözümlenme Tarihi"
            value={fmtDate(complaint.resolvedAt)}
          />
        )}
        <DetailInfoBox
          label="Randevu"
          value={
            complaint.appointmentId ? (
              <Badge size="sm" color="info">Randevuya bağlı</Badge>
            ) : (
              "—"
            )
          }
        />
        <DetailInfoBox label="Kayıt ID" value={complaint.id} />
      </div>

      {!complaint.isResolved && (
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <ActionButton
            tone="success"
            variant="soft"
            onClick={handleResolve}
            disabled={isResolving}
          >
            {isResolving ? "İşleniyor..." : "Çözümlendi Olarak İşaretle"}
          </ActionButton>
        </div>
      )}
    </EntityDetailDrawer>
  );
}
