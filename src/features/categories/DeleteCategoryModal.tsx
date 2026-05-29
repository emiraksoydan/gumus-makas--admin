import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import ActionButton from "../../components/common/ActionButton";
import { TrashBinIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { notifyApiError, notifyApiResponse } from "../../utils/notifyMutation";
import {
  useDeleteCategoryMutation,
  type CategoryNode,
} from "./categoriesApi";

interface FlatOption {
  id: string;
  label: string;
}

function flatten(
  nodes: CategoryNode[],
  depth = 0,
  excludeId?: string,
): FlatOption[] {
  const out: FlatOption[] = [];
  for (const n of nodes) {
    if (excludeId === n.id) continue;
    out.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
    if (n.children.length) out.push(...flatten(n.children, depth + 1, excludeId));
  }
  return out;
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: CategoryNode | null;
  allNodes: CategoryNode[];
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  target,
  allNodes,
}: DeleteCategoryModalProps) {
  const [reparentTo, setReparentTo] = useState<string>("");
  const toast = useToast();
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  useEffect(() => {
    if (isOpen) {
      setReparentTo("");
    }
  }, [isOpen]);

  if (!target) return null;

  const hasChildren = target.children.length > 0;
  const flat = flatten(allNodes, 0, target.id);

  const handleDelete = async () => {
    try {
      const res = await deleteCategory({
        id: target.id,
        reparentTo: reparentTo || null,
      }).unwrap();
      if (notifyApiResponse(toast, res, "Kategori silindi.")) onClose();
    } catch (err) {
      notifyApiError(toast, err, "Kategori silinemedi.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        Kategoriyi Sil
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        <strong>{target.name}</strong> silinecek.
        {hasChildren && (
          <>
            <br />
            Bu kategorinin <strong>{target.children.length}</strong> doğrudan alt kategorisi var.
            Bunların gideceği yeni üst kategoriyi seçin (boş bırakırsanız köke taşınır).
          </>
        )}
      </p>

      {hasChildren && (
        <div className="mb-4">
          <Label>Alt kategoriler için yeni üst kategori</Label>
          <select
            value={reparentTo}
            onChange={(e) => setReparentTo(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
          >
            <option value="">— Köke taşı —</option>
            {flat.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Vazgeç</Button>
        <ActionButton
          tone="danger"
          size="md"
          icon={<TrashBinIcon className="size-4" />}
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? "Siliniyor..." : "Sil"}
        </ActionButton>
      </div>
    </Modal>
  );
}
