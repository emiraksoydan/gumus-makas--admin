import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 overflow-hidden bg-white p-6 dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center overflow-hidden lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}

        {/* Sağ taraf: marka paneli (büyük Gümüş Makas logosu) */}
        <div className="hidden h-full w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2 animate-auth-fade-up">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-sm text-center">
              <img
                src="/images/logo/gumusmakaslogo.png"
                alt="Gümüş Makas"
                className="w-64 h-64 object-contain mb-6 drop-shadow-2xl animate-auth-logo"
              />
              <h2 className="mb-2 text-2xl font-semibold text-white animate-auth-fade-up [animation-delay:200ms]">
                Gümüş Makas
              </h2>
              <p className="text-center text-gray-400 dark:text-white/60 animate-auth-fade-up [animation-delay:350ms]">
                Yönetim paneline güvenli giriş
              </p>
            </div>
          </div>
        </div>

        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
