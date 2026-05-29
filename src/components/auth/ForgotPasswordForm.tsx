import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import AuthBrandHeader from "./AuthBrandHeader";
import { useToast } from "../../context/ToastContext";
import { useAdminForgotPasswordMutation } from "../../features/auth/authApi";
import { notifyApiError, notifyApiResponse } from "../../utils/notifyMutation";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../../features/auth/schemas";

export default function ForgotPasswordForm() {
  const toast = useToast();
  const [forgot, { isLoading }] = useAdminForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const result = await forgot({ email: values.email.trim() }).unwrap();
      notifyApiResponse(
        toast,
        result,
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      );
    } catch (err) {
      notifyApiError(toast, err);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden lg:w-1/2 animate-auth-fade-up">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <AuthBrandHeader />
        <div className="mb-5 sm:mb-8 animate-auth-fade-up [animation-delay:150ms]">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Gümüş Makas - Şifremi Unuttum
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kayıtlı email adresinizi girin, şifre sıfırlama bağlantısı
            göndereceğiz.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="animate-auth-fade-up [animation-delay:300ms]"
        >
          <div className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="admin@gumusmakas.com.tr"
                error={!!errors.email}
                hint={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </Button>
            </div>

            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Giriş ekranına dön
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
