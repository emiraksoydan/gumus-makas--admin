import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ActionButton from "../../components/common/ActionButton";
import ConfirmModal from "../../components/common/ConfirmModal";
import Badge from "../../components/ui/badge/Badge";
import { CheckLineIcon, CloseLineIcon, PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import {
  useDeleteHelpGuideMutation,
  useGetHelpGuidesQuery,
  useSetHelpGuideActiveMutation,
  type HelpGuide,
} from "../../features/helpGuides/helpGuidesApi";
import { useToast } from "../../context/ToastContext";
import { notifyApiError } from "../../utils/notifyMutation";
import HelpGuideFormModal from "../../features/helpGuides/HelpGuideFormModal";
import { UserType } from "../../features/users/usersApi";
import { userTypeLabels } from "../../features/users/userTypeLabels";

const TABS: { key: UserType; label: string }[] = [
  { key: UserType.Customer, label: userTypeLabels[UserType.Customer] },
  { key: UserType.FreeBarber, label: userTypeLabels[UserType.FreeBarber] },
  { key: UserType.BarberStore, label: userTypeLabels[UserType.BarberStore] },
];

export default function HelpGuidesPage() {
  const [activeTab, setActiveTab] = useState<UserType>(UserType.Customer);
  const { data, isLoading, isFetching, error, refetch } = useGetHelpGuidesQuery({
    userType: activeTab,
  });
  const [setActive] = useSetHelpGuideActiveMutation();
  const [deleteGuide] = useDeleteHelpGuideMutation();
  const [formTarget, setFormTarget] = useState<HelpGuide | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HelpGuide | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const guides = useMemo(
    () => (data ?? []).slice().sort((a, b) => a.order - b.order),
    [data],
  );

  const handleToggle = async (g: HelpGuide) => {
    try {
      await setActive({ id: g.id, isActive: !g.isActive }).unwrap();
      toast.success(g.isActive ? "Kayıt pasif yapıldı." : "Kayıt aktif yapıldı.");
    } catch (err) {
      notifyApiError(toast, err, "Durum değiştirilemedi.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteGuide(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      toast.success("Yardım kaydı silindi.");
    } catch (err) {
      notifyApiError(toast, err, "Silme başarısız.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageMeta title="Yardım Rehberi | Gümüş Makas Admin" description="Help guide yönetimi" />
      <PageBreadcrumb pageTitle="Yardım Rehberi" />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Yardım kayıtları yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Tabs + new */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === t.key
                    ? "bg-brand-500 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ActionButton
            tone="success"
            size="md"
            icon={<PlusIcon className="size-4" />}
            onClick={() => setShowCreate(true)}
          >
            Yeni Kayıt
          </ActionButton>
        </div>

        {/* List */}
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {(isLoading || isFetching) && guides.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></span>
              <span className="ml-2">Yükleniyor...</span>
            </div>
          ) : guides.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Bu kullanıcı tipi için kayıt yok. "Yeni Kayıt" ile ekleyin.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {guides.map((g) => (
                <li key={g.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                    {g.order}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {g.title}
                      </span>
                      {g.isActive ? (
                        <Badge size="sm" color="success" variant="solid">Aktif</Badge>
                      ) : (
                        <Badge size="sm" color="warning" variant="solid">Pasif</Badge>
                      )}
                      {g.translationKey && (
                        <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] text-brand-600 dark:text-brand-400 font-mono">
                          {g.translationKey}
                        </span>
                      )}
                    </div>
                    {g.description && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                        {g.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {g.isActive ? (
                      <ActionButton
                        tone="neutral"
                        variant="soft"
                        size="xs"
                        icon={<CloseLineIcon className="size-3.5" />}
                        onClick={() => handleToggle(g)}
                      >
                        Pasifleştir
                      </ActionButton>
                    ) : (
                      <ActionButton
                        tone="success"
                        size="xs"
                        icon={<CheckLineIcon className="size-3.5" />}
                        onClick={() => handleToggle(g)}
                      >
                        Aktive Et
                      </ActionButton>
                    )}
                    <ActionButton
                      tone="info"
                      size="xs"
                      icon={<PencilIcon className="size-3.5" />}
                      onClick={() => setFormTarget(g)}
                    >
                      Düzenle
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      size="xs"
                      icon={<TrashBinIcon className="size-3.5" />}
                      onClick={() => setDeleteTarget(g)}
                    >
                      Sil
                    </ActionButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <HelpGuideFormModal
        isOpen={showCreate || !!formTarget}
        onClose={() => {
          setShowCreate(false);
          setFormTarget(null);
        }}
        target={formTarget}
        defaultUserType={activeTab}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        tone="danger"
        title="Yardım kaydını sil"
        message={
          <>
            <strong>{deleteTarget?.title}</strong> kaydını silmek istediğinize emin misiniz?
            <p className="mt-2 text-xs text-error-600">Bu işlem geri alınamaz.</p>
          </>
        }
        confirmText="Sil"
        isLoading={isDeleting}
      />
    </>
  );
}
