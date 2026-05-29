import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import EntityDetailHero from "../../components/common/EntityDetailHero";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import Badge from "../../components/ui/badge/Badge";
import { formatEntityNumber } from "../../components/common/ParticipantCell";
import { userTypeLabels, userTypeBadgeColor } from "./userTypeLabels";
import type { AdminUser } from "./usersApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

interface UserDetailDrawerProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailDrawer({ user, isOpen, onClose }: UserDetailDrawerProps) {
  user = useRetained(user);
  if (!user) return null;
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      subtitle={formatEntityNumber(user.customerNumber) ?? undefined}
      widthClass="max-w-2xl"
      header={
        <EntityDetailHero name={fullName} imageUrl={user.imageUrl} />
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Kullanıcı Tipi"
          value={
            <Badge size="sm" color={userTypeBadgeColor[user.userType]}>
              {userTypeLabels[user.userType]}
            </Badge>
          }
        />
        <DetailInfoBox label="Müşteri No" value={formatEntityNumber(user.customerNumber)} />
        <DetailInfoBox label="Telefon" value={user.phoneNumber || "—"} />
        <DetailInfoBox
          label="Hesap Durumu"
          value={
            user.isBanned ? (
              <Badge size="sm" color="error">Engelli</Badge>
            ) : user.isActive ? (
              <Badge size="sm" color="success">Aktif</Badge>
            ) : (
              <Badge size="sm" color="warning">Pasif</Badge>
            )
          }
        />
        {user.isBanned && user.banReason && (
          <DetailInfoBox label="Engel Sebebi" value={user.banReason} className="sm:col-span-2" />
        )}
        <DetailInfoBox label="Kayıt Tarihi" value={fmtDate(user.createdAt)} />
        <DetailInfoBox label="Güncellenme" value={fmtDate(user.updatedAt)} />
        <DetailInfoBox label="Kullanıcı ID" value={user.id} className="sm:col-span-2" />
      </div>
    </EntityDetailDrawer>
  );
}
