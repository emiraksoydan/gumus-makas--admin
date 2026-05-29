import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import AuthBrandHeader from "./AuthBrandHeader";
import { useToast } from "../../context/ToastContext";
import { useAdminResetPasswordMutation } from "../../features/auth/authApi";
import { notifyApiError, notifyApiResponse } from "../../utils/notifyMutation";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../../features/auth/schemas";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const [resetPassword, { isLoading }] = useAdminResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Geçersiz bağlantı: token bulunamadı.");
      return;
    }

    try {
      const result = await resetPassword({
        token,
        newPassword: values.password,
      }).unwrap();
      if (notifyApiResponse(toast, result, "Şifreniz güncellendi.")) {
        setTimeout(() => navigate("/signin", { replace: true }), 1500);
      }
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
            Gümüş Makas - Şifre Sıfırlama
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Yeni şifrenizi belirleyin.
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
                Yeni Şifre <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="En az 8 karakter"
                  error={!!errors.password}
                  hint={errors.password?.message}
                  {...register("password")}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-[22px]"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div>
              <Label>
                Yeni Şifre (Tekrar) <span className="text-error-500">*</span>
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Şifreyi tekrar girin"
                error={!!errors.confirm}
                hint={errors.confirm?.message}
                {...register("confirm")}
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
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
