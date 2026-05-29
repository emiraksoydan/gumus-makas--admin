import { useMemo, useState } from "react";
import { AngleDownIcon, AngleRightIcon, PencilIcon, PlusIcon, TrashBinIcon } from "../../icons";
import type { CategoryNode } from "./categoriesApi";

interface CategoryTreeProps {
  nodes: CategoryNode[];
  /** Aramayla highlight için: küçük harfli arama string'i */
  searchLower: string;
  /** Backend arama sonucu eşleşen kategori id'leri (2+ karakter). */
  serverMatchIds?: Set<string> | null;
  onAddChild: (parent: CategoryNode | null) => void;
  onRename: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
}

/**
 * Tüm node id'leri arasında, arama string'iyle eşleşen veya descendant'ı eşleşen
 * node id'lerini döner. Bu set kullanılarak expand otomatik açılır + match'siz dallar
 * gizlenir.
 */
function buildMatchSet(
  nodes: CategoryNode[],
  q: string,
  serverMatchIds: Set<string> | null | undefined,
): { matched: Set<string>; visible: Set<string> } {
  const matched = new Set<string>();
  const visible = new Set<string>();
  const useServer = !!serverMatchIds && serverMatchIds.size >= 0 && q.length >= 2;

  function walk(node: CategoryNode): boolean {
    const selfMatch =
      (q.length > 0 && node.name.toLocaleLowerCase("tr").includes(q)) ||
      (useServer && serverMatchIds!.has(node.id));
    let anyChildVisible = false;
    for (const c of node.children) {
      const childVisible = walk(c);
      anyChildVisible = anyChildVisible || childVisible;
    }
    if (selfMatch) matched.add(node.id);
    if (selfMatch || anyChildVisible) {
      visible.add(node.id);
      return true;
    }
    return false;
  }
  for (const n of nodes) walk(n);
  return { matched, visible };
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const lower = text.toLocaleLowerCase("tr");
  const idx = lower.indexOf(q);
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-warning-500/30 px-0.5 text-gray-900 dark:text-white">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

interface NodeRowProps {
  node: CategoryNode;
  depth: number;
  searchLower: string;
  expanded: Set<string>;
  toggle: (id: string) => void;
  visibility: { matched: Set<string>; visible: Set<string> } | null;
  onAddChild: (parent: CategoryNode | null) => void;
  onRename: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
}

function NodeRow({
  node,
  depth,
  searchLower,
  expanded,
  toggle,
  visibility,
  onAddChild,
  onRename,
  onDelete,
}: NodeRowProps) {
  if (visibility && !visibility.visible.has(node.id)) return null;

  // Arama varsa eşleşen dalları otomatik aç.
  const isExpanded = searchLower
    ? visibility?.visible.has(node.id) ?? expanded.has(node.id)
    : expanded.has(node.id);

  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="group relative flex min-w-0 items-center gap-2 overflow-hidden px-3 py-2.5 transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10"
        style={{ paddingLeft: `${depth * 24 + 14}px`, paddingRight: "14rem" }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            className="flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.06]"
            aria-label={isExpanded ? "Daralt" : "Genişlet"}
          >
            {isExpanded ? <AngleDownIcon className="size-3" /> : <AngleRightIcon className="size-3" />}
          </button>
        ) : (
          <span className="inline-block w-5"></span>
        )}

        <span className="flex-1 truncate text-base font-medium text-gray-800 dark:text-white/90">
          <Highlight text={node.name} q={searchLower} />
          {hasChildren && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({node.children.length})
            </span>
          )}
        </span>

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onAddChild(node)}
            className="inline-flex items-center gap-1 rounded-lg bg-success-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-success-600"
            title="Alt kategori ekle"
          >
            <PlusIcon className="size-3" />
            Ekle
          </button>
          <button
            type="button"
            onClick={() => onRename(node)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-600"
            title="Güncelle"
          >
            <PencilIcon className="size-3" />
            Güncelle
          </button>
          <button
            type="button"
            onClick={() => onDelete(node)}
            className="inline-flex items-center gap-1 rounded-lg bg-error-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-error-600"
            title="Sil"
          >
            <TrashBinIcon className="size-3" />
            Sil
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((c) => (
            <NodeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              searchLower={searchLower}
              expanded={expanded}
              toggle={toggle}
              visibility={visibility}
              onAddChild={onAddChild}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({
  nodes,
  searchLower,
  serverMatchIds,
  onAddChild,
  onRename,
  onDelete,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const visibility = useMemo(() => {
    const q = searchLower;
    if (!q && !serverMatchIds) return null;
    if (q.length < 2 && !serverMatchIds) return null;
    return buildMatchSet(nodes, q, serverMatchIds);
  }, [nodes, searchLower, serverMatchIds]);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="divide-y divide-gray-100 overflow-x-hidden dark:divide-white/[0.05]">
      {nodes.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Henüz kategori yok.
        </div>
      ) : (
        nodes.map((n) => (
          <NodeRow
            key={n.id}
            node={n}
            depth={0}
            searchLower={searchLower}
            expanded={expanded}
            toggle={toggle}
            visibility={visibility}
            onAddChild={onAddChild}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
