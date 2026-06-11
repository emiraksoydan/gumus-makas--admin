import { useState } from "react";
import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import DetailInfoBox from "../../components/common/DetailInfoBox";
import ParticipantCell from "../../components/common/ParticipantCell";
import ImageCarousel from "../../components/common/ImageCarousel";
import Button from "../../components/ui/button/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import Badge from "../../components/ui/badge/Badge";
import { useRetained } from "../../hooks/useRetained";
import {
  socialContentStatusLabels,
  socialOwnerTypeLabels,
  socialPostTypeLabels,
  useRemoveSocialHighlightAdminMutation,
  useRemoveSocialPostAdminMutation,
  useRemoveSocialProfileAdminMutation,
  useRemoveSocialStoryAdminMutation,
  type SocialPostAdmin,
  type SocialProfileAdmin,
  type SocialStoryAdmin,
  type SocialStoryHighlightAdmin,
  SocialContentStatus,
} from "./socialModerationApi";

export type SocialModerationTab = "posts" | "stories" | "profiles" | "highlights";

type DrawerItem =
  | { tab: "posts"; item: SocialPostAdmin }
  | { tab: "stories"; item: SocialStoryAdmin }
  | { tab: "profiles"; item: SocialProfileAdmin }
  | { tab: "highlights"; item: SocialStoryHighlightAdmin };

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

function StatusBadge({ status }: { status: SocialContentStatus }) {
  const tone =
    status === SocialContentStatus.Active
      ? "success"
      : status === SocialContentStatus.Removed
        ? "error"
        : "warning";
  return <Badge color={tone}>{socialContentStatusLabels[status]}</Badge>;
}

export default function SocialModerationDetailDrawer({
  selection,
  isOpen,
  onClose,
}: {
  selection: DrawerItem | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  selection = useRetained(selection);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [removePost, { isLoading: removingPost }] = useRemoveSocialPostAdminMutation();
  const [removeStory, { isLoading: removingStory }] = useRemoveSocialStoryAdminMutation();
  const [removeProfile, { isLoading: removingProfile }] = useRemoveSocialProfileAdminMutation();
  const [removeHighlight, { isLoading: removingHighlight }] = useRemoveSocialHighlightAdminMutation();

  if (!selection) return null;

  const isRemoving = removingPost || removingStory || removingProfile || removingHighlight;
  const alreadyRemoved = selection.item.status === SocialContentStatus.Removed;

  const title =
    selection.tab === "posts"
      ? "Gönderi"
      : selection.tab === "stories"
        ? "Hikaye"
        : selection.tab === "highlights"
          ? "Öne Çıkan"
          : "Sosyal Profil";

  const handleRemove = async () => {
    if (!selection) return;
    if (selection.tab === "posts") await removePost(selection.item.id);
    else if (selection.tab === "stories") await removeStory(selection.item.id);
    else if (selection.tab === "highlights") await removeHighlight(selection.item.id);
    else await removeProfile(selection.item.id);
    setConfirmOpen(false);
    onClose();
  };

  const images: string[] = (() => {
    if (selection.tab === "posts") {
      const url = selection.item.thumbnailUrl;
      return url ? [url] : [];
    }
    if (selection.tab === "stories") {
      const url = selection.item.thumbnailUrl ?? selection.item.mediaUrl;
      return url ? [url] : [];
    }
    if (selection.tab === "highlights") {
      const url = selection.item.coverUrl;
      return url ? [url] : [];
    }
    const url = selection.item.avatarUrl;
    return url ? [url] : [];
  })();

  const confirmMessage =
    selection.tab === "profiles"
      ? "Bu sosyal profil ve aktif gönderi/hikayeleri kaldırılacak. Devam etmek istiyor musunuz?"
      : selection.tab === "stories"
        ? "Bu hikaye kaldırılacak. Devam etmek istiyor musunuz?"
        : selection.tab === "highlights"
          ? "Bu öne çıkan kaldırılacak. Devam etmek istiyor musunuz?"
          : "Bu gönderi kaldırılacak. Devam etmek istiyor musunuz?";

  const removeButtonLabel =
    selection.tab === "profiles"
      ? "Profili Kaldır"
      : selection.tab === "stories"
        ? "Hikayeyi Kaldır"
        : selection.tab === "highlights"
          ? "Öne Çıkanı Kaldır"
          : "Gönderiyi Kaldır";

  return (
    <>
      <EntityDetailDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={fmtDate(selection.item.createdAt)}
        widthClass="max-w-2xl"
        header={images.length > 0 ? <ImageCarousel images={images} alt={title} className="mb-5" /> : undefined}
      >
        <div className="mb-4">
          <StatusBadge status={selection.item.status} />
        </div>

        {selection.tab === "posts" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailInfoBox label="Kullanıcı adı" value={`@${selection.item.profileUsername}`} />
            <DetailInfoBox label="Hesap türü" value={socialOwnerTypeLabels[selection.item.ownerType]} />
            <DetailInfoBox label="Gönderi türü" value={socialPostTypeLabels[selection.item.type]} />
            <DetailInfoBox label="Görüntülenme" value={String(selection.item.viewCount)} />
            <DetailInfoBox label="Beğeni" value={String(selection.item.likeCount)} />
            <DetailInfoBox label="Yorum" value={String(selection.item.commentCount)} />
            <DetailInfoBox label="Medya sayısı" value={String(selection.item.mediaCount)} />
            <DetailInfoBox
              label="Açıklama"
              value={<span className="whitespace-pre-wrap font-normal">{selection.item.caption ?? "—"}</span>}
              className="sm:col-span-2"
            />
            <DetailInfoBox label="Gönderi ID" value={selection.item.id} className="sm:col-span-2" />
          </div>
        )}

        {selection.tab === "stories" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailInfoBox label="Kullanıcı adı" value={`@${selection.item.profileUsername}`} />
            <DetailInfoBox label="Hesap türü" value={socialOwnerTypeLabels[selection.item.ownerType]} />
            <DetailInfoBox label="Süre (sn)" value={selection.item.durationSec != null ? String(selection.item.durationSec) : "—"} />
            <DetailInfoBox label="Bitiş" value={fmtDate(selection.item.expiresAt)} />
            <DetailInfoBox label="Hikaye ID" value={selection.item.id} className="sm:col-span-2" />
          </div>
        )}

        {selection.tab === "highlights" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailInfoBox label="Kullanıcı adı" value={`@${selection.item.profileUsername}`} />
            <DetailInfoBox label="Hesap türü" value={socialOwnerTypeLabels[selection.item.ownerType]} />
            <DetailInfoBox label="Başlık" value={selection.item.title} />
            <DetailInfoBox label="Hikaye sayısı" value={String(selection.item.itemCount)} />
            <DetailInfoBox label="Sıralama" value={String(selection.item.sortOrder)} />
            <DetailInfoBox label="Öne çıkan ID" value={selection.item.id} className="sm:col-span-2" />
          </div>
        )}

        {selection.tab === "profiles" && (
          <>
            <div className="mb-4">
              <ParticipantCell
                name={selection.item.ownerDisplayName ?? selection.item.username}
                imageUrl={selection.item.avatarUrl}
                typeLabel={socialOwnerTypeLabels[selection.item.ownerType]}
                number={selection.item.ownerNumber}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailInfoBox label="Kullanıcı adı" value={`@${selection.item.username}`} />
              <DetailInfoBox label="Gönderi" value={String(selection.item.postCount)} />
              <DetailInfoBox label="Takipçi" value={String(selection.item.followerCount)} />
              <DetailInfoBox label="Takip" value={String(selection.item.followingCount)} />
              <DetailInfoBox
                label="Biyografi"
                value={<span className="whitespace-pre-wrap font-normal">{selection.item.bio ?? "—"}</span>}
                className="sm:col-span-2"
              />
              <DetailInfoBox label="Profil ID" value={selection.item.id} className="sm:col-span-2" />
            </div>
          </>
        )}

        {!alreadyRemoved && (
          <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
            <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)} disabled={isRemoving}>
              {removeButtonLabel}
            </Button>
          </div>
        )}
      </EntityDetailDrawer>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRemove}
        title="İçeriği kaldır"
        message={confirmMessage}
        confirmText="Kaldır"
        tone="danger"
        isLoading={isRemoving}
      />
    </>
  );
}
