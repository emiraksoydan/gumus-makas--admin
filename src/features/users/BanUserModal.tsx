import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import ActionButton from "../../components/common/ActionButton";
import { CloseLineIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { notifyApiError, notifyApiResponse } from "../../utils/notifyMutation";
import { useBanUserMutation } from "./usersApi";
import type { AdminUser } from "./usersApi";
import { useRetained } from "../../hooks/useRetained";

const schema = z.object({
  reason: z
    .string()
    .max(500, { message: "Sebep en fazla 500 karakter olabilir." }),
});

type FormValues = z.infer<typeof schema>;

interface BanUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BanUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: BanUserModalProps) {
  const toast = useToast();
  const [banUser, { isLoading }] = useBanUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (isOpen) reset({ reason: "" });
  }, [isOpen, reset]);

  user = useRetained(user);
  const reason = watch("reason");

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      const res = await banUser({
        userId: user.id,
        reason: values.reason.trim() || null,
      }).unwrap();
      if (notifyApiResponse(toast, res, "Kullanıcı engellendi.")) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      notifyApiError(toast, err, "Engelleme başarısız oldu.");
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        Kullanıcıyı Engelle
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        <strong>{user.firstName} {user.lastName}</strong> ({user.phoneNumber}) hesabı
        engellenecek. İsterseniz neden ekleyin; kullanıcıya hata mesajında gösterilebilir.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div>
            <Label>Engelleme Sebebi (opsiyonel)</Label>
            <textarea
              {...register("reason")}
              placeholder="Örn. KVKK ihlali, spam, taciz..."
              rows={4}
              className={`h-auto w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:text-white/90 dark:placeholder:text-white/30 ${
                errors.reason
                  ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                  : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700"
              }`}
            />
            {errors.reason ? (
              <p className="mt-1 text-xs text-error-500">{errors.reason.message}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">{reason?.length ?? 0}/500</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
              Vazgeç
            </Button>
            <ActionButton
              type="submit"
              tone="danger"
              size="md"
              icon={<CloseLineIcon className="size-4" />}
              disabled={isLoading}
            >
              {isLoading ? "Engelleniyor..." : "Engelle"}
            </ActionButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
