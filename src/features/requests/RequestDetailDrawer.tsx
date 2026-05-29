import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import Badge from "../../components/ui/badge/Badge";
import ActionButton from "../../components/common/ActionButton";
import type { AdminRequest } from "./requestsApi";
import { useMarkRequestProcessedMutation } from "./requestsApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function RequestDetailDrawer({
  request,
  isOpen,
  onClose,
}: {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  request = useRetained(request);
  const [markProcessed, { isLoading }] = useMarkRequestProcessedMutation();

  if (!request) return null;

  const handleToggle = async () => {
    if (!request) return;
    await markProcessed({ id: request.id, isProcessed: !request.isProcessed });
  };

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={request.requestTitle}
      subtitle={fmtDate(request.createdAt)}
      widthClass="max-w-2xl"
      header={
        request.requestFromUserName ? (
          <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Talep Eden
            </p>
            <ParticipantCell
              name={request.requestFromUserName}
              userType={request.requestFromUserType}
              number={request.requestFromCustomerNumber}
            />
          </div>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Durum"
          value={
            request.isProcessed ? (
              <Badge size="sm" color="success">İşlendi</Badge>
            ) : (
              <Badge size="sm" color="warning">Açık</Badge>
            )
          }
        />
        <DetailInfoBox label="Tarih" value={fmtDate(request.createdAt)} />
        <DetailInfoBox
          label="Mesaj"
          value={
            <span className="whitespace-pre-wrap font-normal">{request.requestMessage}</span>
          }
          className="sm:col-span-2"
        />
        <DetailInfoBox label="Talep ID" value={request.id} />
        <DetailInfoBox label="Kullanıcı ID" value={request.requestFromUserId} />
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
        <ActionButton
          tone={request.isProcessed ? "warning" : "success"}
          variant="soft"
          onClick={handleToggle}
          disabled={isLoading}
        >
          {isLoading
            ? "İşleniyor..."
            : request.isProcessed
            ? "Açık Olarak İşaretle"
            : "İşlendi Olarak İşaretle"}
        </ActionButton>
      </div>
    </EntityDetailDrawer>
  );
}
