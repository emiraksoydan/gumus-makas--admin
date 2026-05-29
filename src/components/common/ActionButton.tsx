import type { ReactNode } from "react";

type Tone =
  | "primary"   // brand renkleri — varsayılan
  | "success"   // onay / aktive
  | "warning"   // düzenle / pasifleştir
  | "danger"    // sil / engelle
  | "info"      // görüntüle
  | "neutral";  // gri / pasif

type Size = "xs" | "sm" | "md";
type Variant = "solid" | "soft" | "outline";

interface ActionButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  tone?: Tone;
  size?: Size;
  variant?: Variant;
  title?: string;
  className?: string;
  iconOnly?: boolean; // true ise sadece ikon + padding kare; metin gizli (aria-label için title kullan)
}

const sizeClasses: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

const iconOnlySizeClasses: Record<Size, string> = {
  xs: "h-7 w-7 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

const toneClasses: Record<Tone, Record<Variant, string>> = {
  primary: {
    solid:   "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-theme-xs",
    soft:    "bg-brand-500/10 text-brand-600 hover:bg-brand-500/15 dark:text-brand-400",
    outline: "border border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10",
  },
  success: {
    solid:   "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 shadow-theme-xs",
    soft:    "bg-success-500/10 text-success-600 hover:bg-success-500/15 dark:text-success-400",
    outline: "border border-success-500 text-success-500 hover:bg-success-50 dark:hover:bg-success-500/10",
  },
  warning: {
    solid:   "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700 shadow-theme-xs",
    soft:    "bg-warning-500/10 text-warning-600 hover:bg-warning-500/15 dark:text-warning-400",
    outline: "border border-warning-500 text-warning-500 hover:bg-warning-50 dark:hover:bg-warning-500/10",
  },
  danger: {
    solid:   "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-theme-xs",
    soft:    "bg-error-500/10 text-error-600 hover:bg-error-500/15 dark:text-error-400",
    outline: "border border-error-500 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10",
  },
  info: {
    solid:   "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-theme-xs",
    soft:    "bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 dark:text-blue-400",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10",
  },
  neutral: {
    solid:   "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800",
    soft:    "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]",
  },
};

/**
 * Standart admin aksiyon butonu — ikon + metin + renk tonu.
 * Tüm liste sayfalarındaki "Düzenle / Sil / Aktive Et / Engelle" gibi aksiyonlar için kullanılır.
 *
 * @example
 * <ActionButton tone="danger" icon={<TrashBinIcon className="size-4" />}>Sil</ActionButton>
 * <ActionButton tone="warning" variant="soft" icon={<PencilIcon className="size-4" />}>Düzenle</ActionButton>
 */
export default function ActionButton({
  children,
  icon,
  onClick,
  disabled = false,
  type = "button",
  tone = "primary",
  size = "sm",
  variant = "solid",
  title,
  className = "",
  iconOnly = false,
}: ActionButtonProps) {
  const sizeCls = iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size];
  const toneCls = toneClasses[tone][variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-500 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 ${sizeCls} ${toneCls} ${className}`}
    >
      {icon}
      {!iconOnly && children}
    </button>
  );
}
