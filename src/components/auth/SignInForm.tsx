import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import AuthBrandHeader from "./AuthBrandHeader";
import { useAdminLoginMutation } from "../../features/auth/authApi";
import { loggedIn } from "../../features/auth/authSlice";
import { useAppDispatch } from "../../store/hooks";
import { signInSchema, type SignInFormValues } from "../../features/auth/schemas";
import { getAdminIdFromToken } from "../../utils/jwt";

interface LocationState {
  from?: { pathname?: string };
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as LocationState | undefined)?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const result = await adminLogin({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      if (!result.success || !result.data) {
        setError("password", {
          type: "server",
          message: result.message || "Giriş başarısız.",
        });
        return;
      }
      const token = result.data.token;
      const adminId =
        result.data.adminId ?? getAdminIdFromToken(token);
      dispatch(
        loggedIn({
          token,
          tokenExpiration: result.data.expiration,
          refreshToken: result.data.refreshToken,
          refreshTokenExpires: result.data.refreshTokenExpires,
          admin: {
            id: adminId,
            email: result.data.adminEmail ?? values.email.trim(),
            fullName: result.data.adminFullName,
            profileImageUrl: result.data.adminProfileImageUrl ?? null,
          },
        }),
      );
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const anyErr = err as { data?: unknown; status?: number };
      let msg = "Giriş başarısız. Bilgilerinizi kontrol edin.";
      if (typeof anyErr.data === "string") msg = anyErr.data;
      else if (
        anyErr.data &&
        typeof anyErr.data === "object" &&
        "message" in (anyErr.data as Record<string, unknown>)
      ) {
        msg = String((anyErr.data as Record<string, unknown>).message);
      }
      // Sunucu mesajı içeriğine göre ilgili alana yönlendir.
      const lower = msg.toLocaleLowerCase("tr");
      if (lower.includes("email") || lower.includes("kayıtlı")) {
        setError("email", { type: "server", message: msg });
      } else {
        setError("password", { type: "server", message: msg });
      }
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden lg:w-1/2 animate-auth-fade-up">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <AuthBrandHeader />
          <div className="mb-5 sm:mb-8 animate-auth-fade-up [animation-delay:150ms]">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Gümüş Makas - Yönetim Paneli Girişi
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Email ve şifrenizle giriş yapın.
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
                <Label>
                  Şifre <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Şifrenizi girin"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={keepLoggedIn} onChange={setKeepLoggedIn} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Beni hatırla
                  </span>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Şifremi unuttum
                </Link>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
