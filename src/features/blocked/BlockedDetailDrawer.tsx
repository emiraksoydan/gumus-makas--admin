import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import type { AdminBlocked } from "./blockedApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function BlockedDetailDrawer({
  item,
  isOpen,
  onClose,
}: {
  item: AdminBlocked | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  item = useRetained(item);
  if (!item) return null;

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Engelleme Kaydı"
      subtitle={fmtDate(item.createdAt)}
      widthClass="max-w-2xl"
    >
      <div className="mb-4 space-y-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Engelleyen
          </p>
          <ParticipantCell
            name={item.blockedFromUserName}
            imageUrl={item.blockedFromUserImage}
            userType={item.blockedFromUserType}
            number={item.blockedFromCustomerNumber}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Engellenen
          </p>
          <ParticipantCell
            name={item.targetUserName}
            imageUrl={item.targetUserImage}
            userType={item.targetUserType}
            number={item.targetCustomerNumber}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <DetailInfoBox
          label="Sebep"
          value={
            <span className="whitespace-pre-wrap font-normal">{item.blockReason || "—"}</span>
          }
        />
        <DetailInfoBox label="Kayıt ID" value={item.id} />
      </div>
    </EntityDetailDrawer>
  );
}
