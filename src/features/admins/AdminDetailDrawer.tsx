import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import { useRetained } from "../../hooks/useRetained";
import EntityDetailHero from "../../components/common/EntityDetailHero";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import Badge from "../../components/ui/badge/Badge";
import type { AdminUserItem } from "./adminsApi";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

export default function AdminDetailDrawer({
  admin,
  isOpen,
  onClose,
}: {
  admin: AdminUserItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  admin = useRetained(admin);
  if (!admin) return null;

  return (
    <EntityDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={admin.fullName || "Admin"}
      subtitle={admin.email}
      widthClass="max-w-xl"
      header={
        <EntityDetailHero
          name={admin.fullName || admin.email}
          imageUrl={admin.profileImageUrl}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailInfoBox
          label="Durum"
          value={
            admin.isActive ? (
              <Badge size="sm" color="success">Aktif</Badge>
            ) : (
              <Badge size="sm" color="warning">Pasif</Badge>
            )
          }
        />
        <DetailInfoBox label="E-posta" value={admin.email} />
        <DetailInfoBox label="Son Giriş" value={fmtDate(admin.lastLoginAt)} />
        <DetailInfoBox label="Oluşturulma" value={fmtDate(admin.createdAt)} />
        <DetailInfoBox label="Güncellenme" value={fmtDate(admin.updatedAt)} />
        <DetailInfoBox label="Admin ID" value={admin.id} className="sm:col-span-2" />
      </div>
    </EntityDetailDrawer>
  );
}
