import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useToast } from "../../context/ToastContext";
import { notifyApiError, notifyApiResponse } from "../../utils/notifyMutation";
import { useSetSubscriptionMutation } from "./usersApi";
import type { AdminUser } from "./usersApi";
import { useRetained } from "../../hooks/useRetained";

const schema = z.object({
  endDate: z
    .string()
    .min(1, { message: "Bitiş tarihi zorunludur." })
    .refine((v) => !isNaN(new Date(v).getTime()), { message: "Geçerli bir tarih girin." }),
});

type FormValues = z.infer<typeof schema>;

interface SubscriptionModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function toInputDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addMonths(d: Date, months: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

export default function SubscriptionModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionModalProps) {
  const toast = useToast();
  const [setSubscription, { isLoading }] = useSetSubscriptionMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { endDate: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ endDate: toInputDate(addMonths(new Date(), 1)) });
    }
  }, [isOpen, reset]);

  user = useRetained(user);
  const presetAdd = (months: number) => {
    setValue("endDate", toInputDate(addMonths(new Date(), months)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      const isoEnd = new Date(`${values.endDate}T23:59:59Z`).toISOString();
      const res = await setSubscription({ userId: user.id, endDate: isoEnd }).unwrap();
      if (notifyApiResponse(toast, res, "Abonelik süresi güncellendi.")) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      notifyApiError(toast, err, "Abonelik güncellenemedi.");
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        Abonelik Süresi Ayarla
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        <strong>{user.firstName} {user.lastName}</strong> kullanıcısının abonelik bitiş tarihini
        güncelle.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div>
            <Label>Bitiş Tarihi</Label>
            <Input
              type="date"
              error={!!errors.endDate}
              hint={errors.endDate?.message}
              {...register("endDate")}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => presetAdd(m)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                +{m} ay
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
              Vazgeç
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
