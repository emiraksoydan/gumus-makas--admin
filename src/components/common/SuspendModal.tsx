import { useState } from "react";
import { Modal } from "../ui/modal";
import ActionButton from "./ActionButton";
import { AlertHexaIcon } from "../../icons";

interface SuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  entityName: string;
  isLoading?: boolean;
}

export default function SuspendModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  isLoading = false,
}: SuspendModalProps) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm(reason);
    setReason("");
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-warning-500/10 text-warning-500 ring-1 ring-warning-500/20">
          <AlertHexaIcon className="size-6" />
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Askıya Al
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <strong>{entityName}</strong> adlı kaydı askıya almak istediğinizden emin misiniz?
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Sebep <span className="text-gray-400">(opsiyonel)</span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Askıya alma sebebini yazın..."
          className="w-full resize-none rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-warning-400 focus:outline-hidden focus:ring-3 focus:ring-warning-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30"
        />
      </div>

      <div className="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          Vazgeç
        </button>
        <ActionButton
          tone="warning"
          size="md"
          icon={<AlertHexaIcon className="size-4" />}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? "İşleniyor..." : "Askıya Al"}
        </ActionButton>
      </div>
    </Modal>
  );
}
