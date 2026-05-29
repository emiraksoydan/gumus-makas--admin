import { useEffect, useMemo, useRef, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import UserAvatar from "../components/common/UserAvatar";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectAdminProfile,
  setAdminProfile,
} from "../features/auth/authSlice";
import {
  useChangeMyAdminPasswordMutation,
  useGetMyAdminProfileQuery,
  useRemoveMyAdminAvatarMutation,
  useUpdateMyAdminProfileMutation,
  useUploadMyAdminAvatarMutation,
} from "../features/admins/adminsApi";
import { PencilIcon, LockIcon, MailIcon, UserCircleIcon, TrashBinIcon } from "../icons";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../utils/apiError";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return value;
  }
}

export default function UserProfiles() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const storedAdmin = useAppSelector(selectAdminProfile);
  const { data: me, isFetching } = useGetMyAdminProfileQuery();

  const admin = me ?? storedAdmin ?? null;
  const displayName = admin?.fullName?.trim() || "Yönetici";
  const email = admin?.email ?? "—";
  const [first, ...rest] = displayName.split(" ");
  const last = rest.join(" ");
  const profileImageUrl = admin?.profileImageUrl ?? null;

  const lastLoginAt = (me as { lastLoginAt?: string | null } | undefined)?.lastLoginAt;
  const createdAt = (me as { createdAt?: string | null } | undefined)?.createdAt;
  const isActive = (me as { isActive?: boolean } | undefined)?.isActive ?? true;

  // Sidebar'daki UserDropdown ile bilgileri senkronlamak için Redux'a yaz.
  useEffect(() => {
    if (
      me &&
      (storedAdmin?.fullName !== me.fullName ||
        storedAdmin?.email !== me.email ||
        storedAdmin?.profileImageUrl !== me.profileImageUrl)
    ) {
      dispatch(
        setAdminProfile({
          id: me.id,
          fullName: me.fullName,
          email: me.email,
          profileImageUrl: me.profileImageUrl ?? null,
        }),
      );
    }
  }, [me, storedAdmin?.fullName, storedAdmin?.email, storedAdmin?.profileImageUrl, dispatch]);

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadAvatar, { isLoading: isUploading }] = useUploadMyAdminAvatarMutation();
  const [removeAvatar, { isLoading: isRemoving }] = useRemoveMyAdminAvatarMutation();

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosyayı tekrar seçebilmek için
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5 MB'tan büyük olamaz.");
      return;
    }
    try {
      const res = await uploadAvatar(file).unwrap();
      if (res.success && res.data) {
        dispatch(
          setAdminProfile({
            id: res.data.id,
            fullName: res.data.fullName,
            email: res.data.email,
            profileImageUrl: res.data.profileImageUrl ?? null,
          }),
        );
        toast.success(res.message || "Profil fotoğrafı güncellendi.");
      } else {
        toast.error(res.message || "Yükleme başarısız.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Yükleme başarısız."));
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await removeAvatar().unwrap();
      if (res.success && res.data) {
        dispatch(
          setAdminProfile({
            id: res.data.id,
            fullName: res.data.fullName,
            email: res.data.email,
            profileImageUrl: null,
          }),
        );
        toast.success(res.message || "Profil fotoğrafı kaldırıldı.");
      } else {
        toast.error(res.message || "Fotoğraf kaldırılamadı.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Fotoğraf kaldırılamadı."));
    }
  };

  return (
    <>
      <PageMeta title="Profil | Gümüş Makas Admin" description="Yönetici profil bilgileri" />
      <PageBreadcrumb pageTitle="Profil" />

      <div className="space-y-6 animate-content-in">
        {/* Üst kart — kim olduğunu sidebar ile aynı stil ve aynı verilerle gösterir */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="h-28 bg-gradient-to-r from-brand-500 to-brand-700" />
          <div className="flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <div className="rounded-full border-4 border-white bg-white shadow-theme-md dark:border-gray-900 dark:bg-gray-900">
                  <UserAvatar
                    firstName={first}
                    lastName={last}
                    imageUrl={profileImageUrl}
                    size={96}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Fotoğrafı değiştir"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-white shadow-theme-sm transition-all duration-500 ease-in-out hover:bg-brand-600 disabled:opacity-50 dark:border-gray-900"
                >
                  {isUploading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <PencilIcon className="size-4" />
                  )}
                </button>
                {profileImageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isRemoving}
                    title="Fotoğrafı kaldır"
                    className="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-error-500 text-white shadow-theme-sm transition-all duration-500 ease-in-out hover:bg-error-600 disabled:opacity-50 dark:border-gray-900"
                  >
                    <TrashBinIcon className="size-4" />
                  </button>
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {isFetching && !admin ? "Yükleniyor..." : displayName}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MailIcon className="size-4" />
                  {email}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-medium uppercase text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-1">
              <Button
                variant="outline"
                size="sm"
                startIcon={<LockIcon className="size-4" />}
                onClick={() => setPwOpen(true)}
              >
                Şifre Değiştir
              </Button>
              <Button
                size="sm"
                startIcon={<PencilIcon className="size-4" />}
                onClick={() => setEditOpen(true)}
              >
                Profili Düzenle
              </Button>
            </div>
          </div>
        </div>

        {/* Bilgi kartı */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-white/90">
            <UserCircleIcon className="size-5 text-brand-500" /> Hesap Bilgileri
          </h3>
          <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            <InfoRow label="Ad Soyad" value={displayName} />
            <InfoRow label="E-posta" value={email} />
            <InfoRow
              label="Durum"
              value={
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isActive
                      ? "bg-success-500/10 text-success-600 dark:text-success-400"
                      : "bg-error-500/10 text-error-600 dark:text-error-400"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${isActive ? "bg-success-500" : "bg-error-500"}`}
                  />
                  {isActive ? "Aktif" : "Pasif"}
                </span>
              }
            />
            <InfoRow label="Son Giriş" value={formatDate(lastLoginAt)} />
            <InfoRow label="Hesap Oluşturulma" value={formatDate(createdAt)} />
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialName={displayName}
        initialEmail={email}
        initialImageUrl={profileImageUrl}
      />
      <ChangePasswordModal isOpen={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="text-sm font-medium text-gray-800 dark:text-white/90">{value}</div>
    </div>
  );
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialEmail: string;
  initialImageUrl: string | null;
}

function EditProfileModal({
  isOpen,
  onClose,
  initialName,
  initialEmail,
  initialImageUrl,
}: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [updateProfile, { isLoading }] = useUpdateMyAdminProfileMutation();
  const [fullName, setFullName] = useState(initialName === "Yönetici" ? "" : initialName);
  const [email, setEmail] = useState(initialEmail === "—" ? "" : initialEmail);
  useEffect(() => {
    if (isOpen) {
      setFullName(initialName === "Yönetici" ? "" : initialName);
      setEmail(initialEmail === "—" ? "" : initialEmail);
    }
  }, [isOpen, initialName, initialEmail]);

  const canSubmit = useMemo(
    () => fullName.trim().length >= 2 && /\S+@\S+\.\S+/.test(email.trim()),
    [fullName, email],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      }).unwrap();
      if (res.success && res.data) {
        dispatch(
          setAdminProfile({
            id: res.data.id,
            fullName: res.data.fullName,
            email: res.data.email,
            profileImageUrl:
              // API dönüşünde profil resmi dönmüyorsa mevcut değeri koru.
              res.data.profileImageUrl ?? initialImageUrl,
          }),
        );
        onClose();
        toast.success(res.message || "Profil güncellendi.");
      } else {
        toast.error(res.message || "Güncelleme başarısız.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Güncelleme başarısız."));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Profili Düzenle
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Ad ve e-posta bilgilerinizi güncelleyin.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label>Ad Soyad</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Örn. Ali Yılmaz"
          />
        </div>
        <div>
          <Label>E-posta</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gumusmakas.com.tr"
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Vazgeç
          </Button>
          <Button type="submit" disabled={!canSubmit || isLoading}>
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const toast = useToast();
  const [changePassword, { isLoading }] = useChangeMyAdminPasswordMutation();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  useEffect(() => {
    if (isOpen) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }, [isOpen]);

  const canSubmit =
    current.length > 0 && next.length >= 8 && next === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.warning("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (next.length < 8) {
      toast.warning("Yeni şifre en az 8 karakter olmalıdır.");
      return;
    }
    try {
      const res = await changePassword({ currentPassword: current, newPassword: next }).unwrap();
      if (res.success) {
        toast.success(res.message || "Şifre değiştirildi.");
        setTimeout(onClose, 800);
      } else {
        toast.error(res.message || "Şifre değiştirilemedi.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Şifre değiştirilemedi."));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Şifre Değiştir
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Yeni şifreniz en az 8 karakter olmalıdır.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label>Mevcut Şifre</Label>
          <Input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <Label>Yeni Şifre</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div>
          <Label>Yeni Şifre (Tekrar)</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Vazgeç
          </Button>
          <Button type="submit" disabled={!canSubmit || isLoading}>
            {isLoading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
