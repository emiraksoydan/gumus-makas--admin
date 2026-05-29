import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ActionButton from "../../components/common/ActionButton";
import { PlusIcon } from "../../icons";
import { useAdminSearchFilterIds } from "../../hooks/useAdminSearchFilterIds";
import {
  useGetCategoryHierarchyQuery,
  type CategoryNode,
} from "../../features/categories/categoriesApi";
import CategoryTree from "../../features/categories/CategoryTree";
import CategoryFormModal from "../../features/categories/CategoryFormModal";
import DeleteCategoryModal from "../../features/categories/DeleteCategoryModal";

function countAllNodes(nodes: CategoryNode[]): number {
  let n = 0;
  for (const node of nodes) {
    n += 1 + countAllNodes(node.children);
  }
  return n;
}

export default function CategoriesPage() {
  const { data, isLoading, isFetching, error, refetch } = useGetCategoryHierarchyQuery();
  const allNodes = useMemo(() => data ?? [], [data]);
  const totalCount = useMemo(() => countAllNodes(allNodes), [allNodes]);

  const [search, setSearch] = useState("");
  const {
    matchIds,
    isSearching,
    isServerFilterActive,
    isSearchError,
  } = useAdminSearchFilterIds("Category", search);

  const serverMatchIdsForTree =
    isServerFilterActive && isSearching && !matchIds
      ? new Set<string>()
      : matchIds;
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [target, setTarget] = useState<CategoryNode | null>(null);
  const [toDelete, setToDelete] = useState<CategoryNode | null>(null);

  const handleAddRoot = () => {
    setTarget(null);
    setFormMode("create");
  };
  const handleAddChild = (parent: CategoryNode | null) => {
    setTarget(parent);
    setFormMode("create");
  };
  const handleEdit = (node: CategoryNode) => {
    setTarget(node);
    setFormMode("edit");
  };

  return (
    <>
      <PageMeta title="Kategoriler | Gümüş Makas Admin" description="Hiyerarşik kategori yönetimi" />
      <PageBreadcrumb pageTitle="Kategoriler" />

      {error && !data ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400">
          Kategoriler yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] [&_*]:max-w-full">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              type="search"
              placeholder="Kategori adı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 sm:w-80"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Toplam <strong>{totalCount}</strong> kategori
              {isSearching ? (
                <span className="ml-2 inline-flex items-center gap-1 text-brand-500">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
                  Aranıyor…
                </span>
              ) : null}
              {isSearchError && isServerFilterActive ? (
                <span className="ml-2 text-error-500">Arama başarısız</span>
              ) : null}
            </span>
          </div>
          <ActionButton
            tone="success"
            size="md"
            icon={<PlusIcon className="size-4" />}
            onClick={handleAddRoot}
          >
            Kök Kategori Ekle
          </ActionButton>
        </div>

        {/* Tree */}
        <div className="max-h-[calc(100vh-260px)] overflow-x-hidden overflow-y-auto">
          {isLoading || isFetching ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500"></span>
              <span className="ml-2">Yükleniyor...</span>
            </div>
          ) : (
            <CategoryTree
              nodes={allNodes}
              searchLower={search.trim().toLocaleLowerCase("tr")}
              serverMatchIds={serverMatchIdsForTree}
              onAddChild={handleAddChild}
              onRename={handleEdit}
              onDelete={(node) => setToDelete(node)}
            />
          )}
        </div>
      </div>

      <CategoryFormModal
        isOpen={formMode !== null}
        mode={formMode ?? "create"}
        target={target}
        allNodes={allNodes}
        onClose={() => {
          setFormMode(null);
          setTarget(null);
        }}
      />
      <DeleteCategoryModal
        isOpen={!!toDelete}
        target={toDelete}
        allNodes={allNodes}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
