import { useEffect, useMemo } from "react";
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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  type CategoryNode,
} from "./categoriesApi";

const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Kategori adı zorunludur." })
    .max(256, { message: "En fazla 256 karakter olabilir." }),
  parentId: z.string(),
});

type FormValues = z.infer<typeof schema>;

type Mode = "create" | "edit";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
  /** create: parent (null = root); edit: editing this node */
  target: CategoryNode | null;
  /** Edit modunda parent dropdown'ı için tüm node'ları düz liste olarak ver */
  allNodes: CategoryNode[];
}

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
    if (excludeId === n.id) continue; // kendisi ve subtree
    out.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
    if (n.children.length) out.push(...flatten(n.children, depth + 1, excludeId));
  }
  return out;
}

function findParentId(nodes: CategoryNode[], childId: string): string | null {
  function walk(list: CategoryNode[], curParent: string | null): string | null {
    for (const n of list) {
      if (n.id === childId) return curParent;
      const found = walk(n.children, n.id);
      if (found !== null) return found;
    }
    return null;
  }
  return walk(nodes, null);
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  mode,
  target,
  allNodes,
}: CategoryFormModalProps) {
  const toast = useToast();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: "", parentId: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "create") {
      reset({ name: "", parentId: target?.id ?? "" });
    } else if (target) {
      const parent = findParentId(allNodes, target.id);
      reset({ name: target.name, parentId: parent ?? "" });
    }
  }, [isOpen, mode, target, allNodes, reset]);

  const parentOptions = useMemo(() => {
    return flatten(allNodes, 0, mode === "edit" ? target?.id : undefined);
  }, [allNodes, mode, target]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      parentId: values.parentId || null,
    };
    try {
      if (mode === "create") {
        const res = await createCategory(payload).unwrap();
        if (!notifyApiResponse(toast, res, "Kategori oluşturuldu.")) return;
      } else if (target) {
        const res = await updateCategory({ id: target.id, ...payload }).unwrap();
        if (!notifyApiResponse(toast, res, "Kategori güncellendi.")) return;
      }
      onClose();
    } catch (err) {
      notifyApiError(toast, err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        {mode === "create" ? "Yeni Kategori" : "Kategoriyi Düzenle"}
      </h3>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        {mode === "create"
          ? target
            ? `"${target.name}" altına yeni alt kategori ekleyin.`
            : "Kök seviyesinde yeni kategori ekleyin."
          : "Kategori adını değiştirebilir veya üst kategorisini taşıyabilirsiniz."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div>
            <Label>
              Kategori Adı <span className="text-error-500">*</span>
            </Label>
            <Input
              error={!!errors.name}
              hint={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div>
            <Label>Üst Kategori</Label>
            <select
              {...register("parentId")}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
            >
              <option value="">— Kök (üst kategori yok) —</option>
              {parentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
              Vazgeç
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
