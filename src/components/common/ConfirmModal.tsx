import type { ReactNode } from "react";
import { Modal } from "../ui/modal";
import ActionButton from "./ActionButton";
import {
  AlertHexaIcon,
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
} from "../../icons";

export type ConfirmTone = "danger" | "warning" | "success" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  tone?: ConfirmTone;
  isLoading?: boolean;
  /** Onay butonunda gösterilecek ikon (opsiyonel). Verilmezse tone'a göre default'tan seçilir. */
  confirmIcon?: ReactNode;
}

const TONE_CONFIG: Record<
  ConfirmTone,
  {
    badgeBg: string;
    icon: ReactNode;
    actionTone: "danger" | "warning" | "success" | "info";
  }
> = {
  danger: {
    badgeBg: "bg-error-500/10 text-error-500 ring-1 ring-error-500/20",
    icon: <AlertHexaIcon className="size-6" />,
    actionTone: "danger",
  },
  warning: {
    badgeBg: "bg-warning-500/10 text-warning-500 ring-1 ring-warning-500/20",
    icon: <AlertIcon className="size-6" />,
    actionTone: "warning",
  },
  success: {
    badgeBg: "bg-success-500/10 text-success-500 ring-1 ring-success-500/20",
    icon: <CheckCircleIcon className="size-6" />,
    actionTone: "success",
  },
  info: {
    badgeBg: "bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20",
    icon: <InfoIcon className="size-6" />,
    actionTone: "info",
  },
};

/**
 * Standart onay modalı: silme / pasifleştirme / aktive etme / kritik aksiyonlar için.
 * Native window.confirm yerine bunu kullan.
 *
 * @example
 * <ConfirmModal
 *   isOpen={!!target}
 *   onClose={() => setTarget(null)}
 *   onConfirm={() => deleteThing(target.id)}
 *   tone="danger"
 *   title="Silmek istediğinizden emin misiniz?"
 *   message="Bu işlem geri alınamaz."
 *   confirmText="Sil"
 * />
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  tone = "danger",
  isLoading = false,
  confirmIcon,
}: ConfirmModalProps) {
  const cfg = TONE_CONFIG[tone];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${cfg.badgeBg}`}
        >
          {cfg.icon}
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          {cancelText}
        </button>
        <ActionButton
          tone={cfg.actionTone}
          size="md"
          icon={confirmIcon ?? cfg.icon}
          onClick={() => onConfirm()}
          disabled={isLoading}
        >
          {isLoading ? "İşleniyor..." : confirmText}
        </ActionButton>
      </div>
    </Modal>
  );
}
