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
import { useCreateAdminMutation } from "./adminsApi";

const schema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Ad Soyad en az 2 karakter olmalıdır." })
    .max(128, { message: "Ad Soyad en fazla 128 karakter olabilir." }),
  email: z
    .string()
    .min(1, { message: "Email zorunludur." })
    .email({ message: "Geçerli bir email girin." }),
  password: z
    .string()
    .min(8, { message: "Şifre en az 8 karakter olmalıdır." }),
});

type FormValues = z.infer<typeof schema>;

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAdminModal({ isOpen, onClose }: CreateAdminModalProps) {
  const toast = useToast();
  const [createAdmin, { isLoading }] = useCreateAdminMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "" },
  });

  useEffect(() => {
    if (isOpen) reset({ fullName: "", email: "", password: "" });
  }, [isOpen, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await createAdmin({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();
      if (notifyApiResponse(toast, res, "Admin oluşturuldu.")) {
        onClose();
      }
    } catch (err) {
      notifyApiError(toast, err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        Yeni Admin Oluştur
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Yeni admin email ve şifre ile giriş yapabilecek. Şifreyi yeni admin'e güvenli bir kanaldan iletin.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div>
            <Label>
              Ad Soyad <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Örn. Ali Yılmaz"
              error={!!errors.fullName}
              hint={errors.fullName?.message}
              {...register("fullName")}
            />
          </div>
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              autoComplete="off"
              placeholder="admin2@gumusmakas.com.tr"
              error={!!errors.email}
              hint={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div>
            <Label>
              Geçici Şifre <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="En az 8 karakter"
              error={!!errors.password}
              hint={errors.password?.message}
              {...register("password")}
            />
            <p className="mt-1 text-xs text-gray-400">
              Admin ilk girişinden sonra "Şifremi unuttum" akışıyla değiştirebilir.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
              Vazgeç
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
