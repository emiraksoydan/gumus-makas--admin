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
import {
  useCreateHelpGuideMutation,
  useUpdateHelpGuideMutation,
  type HelpGuide,
} from "./helpGuidesApi";
import { UserType } from "../users/usersApi";
import { userTypeLabels } from "../users/userTypeLabels";

const schema = z.object({
  userType: z.number().int(),
  title: z.string().min(1, { message: "Başlık zorunludur." }).max(256),
  description: z.string().max(2000),
  translationKey: z.string().max(128),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface HelpGuideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** edit modunda mevcut kayıt, create modunda null */
  target: HelpGuide | null;
  /** create modunda default userType */
  defaultUserType: UserType;
}

export default function HelpGuideFormModal({
  isOpen,
  onClose,
  target,
  defaultUserType,
}: HelpGuideFormModalProps) {
  const toast = useToast();
  const [create, { isLoading: isCreating }] = useCreateHelpGuideMutation();
  const [update, { isLoading: isUpdating }] = useUpdateHelpGuideMutation();
  const isLoading = isCreating || isUpdating;
  const isEdit = !!target;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      userType: defaultUserType,
      title: "",
      description: "",
      translationKey: "",
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (target) {
      reset({
        userType: target.userType,
        title: target.title,
        description: target.description,
        translationKey: target.translationKey,
        order: target.order,
        isActive: target.isActive,
      });
    } else {
      reset({
        userType: defaultUserType,
        title: "",
        description: "",
        translationKey: "",
        order: 0,
        isActive: true,
      });
    }
  }, [isOpen, target, defaultUserType, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && target) {
        const res = await update({ id: target.id, ...values }).unwrap();
        if (!notifyApiResponse(toast, res, "Yardım kaydı güncellendi.")) return;
      } else {
        const res = await create(values).unwrap();
        if (!notifyApiResponse(toast, res, "Yardım kaydı oluşturuldu.")) return;
      }
      onClose();
    } catch (err) {
      notifyApiError(toast, err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Yardım Kaydını Düzenle" : "Yeni Yardım Kaydı"}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div>
            <Label>Kullanıcı Tipi</Label>
            <select
              {...register("userType", { valueAsNumber: true })}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
            >
              {Object.entries(userTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Başlık <span className="text-error-500">*</span></Label>
            <Input
              error={!!errors.title}
              hint={errors.title?.message}
              {...register("title")}
            />
          </div>
          <div>
            <Label>Açıklama</Label>
            <textarea
              {...register("description")}
              rows={4}
              className="h-auto w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sıra (Order)</Label>
              <Input
                type="number"
                {...register("order", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label>Çeviri Anahtarı (opsiyonel)</Label>
              <Input
                placeholder="örn. hg_c_01"
                {...register("translationKey")}
              />
              <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                Mobil uygulamanın bu kaydın metnini çok dilli (i18n) göstermesi için
                kullandığı sabit anahtar. Boş bırakılırsa başlık/açıklama olduğu gibi
                gösterilir. Benzersiz olmalı (ör. müşteri kayıtları için hg_c_01, hg_c_02…).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="hg-active"
              type="checkbox"
              {...register("isActive")}
              className="h-4 w-4 rounded border-gray-300 text-brand-500"
            />
            <label htmlFor="hg-active" className="text-sm text-gray-700 dark:text-gray-300">
              Aktif
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
              Vazgeç
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
