import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useAdminSearchFilterIds } from "../../hooks/useAdminSearchFilterIds";
import type { AdminSearchKind } from "../../features/search/adminSearchApi";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { AngleDownIcon, AngleLeftIcon, AngleRightIcon, AngleUpIcon } from "../../icons";
import AppIcon from "../icons/AppIcon";
import { TableRowSkeleton } from "./Skeleton";
import { downloadExcel } from "../../utils/exportExcel";
import { downloadPdf } from "../../utils/exportPdf";

interface DataTableProps<TRow> {
  data: TRow[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TRow, any>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  searchPlaceholder?: string;
  /** Backend `/api/admin/search` ile filtreler (2+ karakter). */
  searchKind?: AdminSearchKind;
  getRowId?: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
  toolbarRight?: ReactNode;
  /** Arama kutusunun sağında filtre ikonu */
  filterControl?: ReactNode;
  initialPageSize?: number;
  /** Excel ve PDF indirme düğmeleri için dosya adı (uzantısız) */
  exportFilename?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function DataTable<TRow>({
  data,
  columns,
  isLoading,
  emptyMessage = "Kayıt bulunamadı.",
  emptyDescription = "Henüz görüntülenecek bir kayıt bulunmuyor.",
  emptyIcon,
  searchPlaceholder = "Ara...",
  searchKind,
  getRowId,
  onRowClick,
  toolbarRight,
  filterControl,
  initialPageSize = 10,
  exportFilename,
}: DataTableProps<TRow>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    matchIds,
    isServerFilterActive,
    isSearching,
    isSearchError,
  } = useAdminSearchFilterIds(searchKind, globalFilter);

  // Sabit referans — her render'da yeni fonksiyon üretmemek için useCallback.
  // Aksi halde tableData useMemo'su her render'da yeniden hesaplanır ve
  // react-table tüm veriyi yeniden sıralar (büyük listelerde donma sebebi).
  const resolveRowId = useCallback(
    (row: TRow) => getRowId?.(row) ?? String((row as { id?: string }).id ?? ""),
    [getRowId],
  );

  const useClientFilter = !searchKind;

  const tableData = useMemo(() => {
    if (!searchKind || !isServerFilterActive) return data;
    if (isSearchError) return data;
    if (isSearching && !matchIds) return [];
    if (!matchIds) return data;
    return data.filter((row) => matchIds.has(resolveRowId(row)));
  }, [
    data,
    searchKind,
    isServerFilterActive,
    isSearchError,
    isSearching,
    matchIds,
    resolveRowId,
  ]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      ...(useClientFilter ? { globalFilter } : {}),
    },
    onGlobalFilterChange: useClientFilter ? setGlobalFilter : undefined,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(useClientFilter ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  const buildExportData = useCallback(() => {
    const exportableCols = table.getAllFlatColumns().filter((col) => {
      const def = col.columnDef as { accessorKey?: string; accessorFn?: unknown; header?: unknown };
      return (def.accessorKey || def.accessorFn) && typeof def.header === "string" && def.header.trim() !== "";
    });
    const sourceRows = useClientFilter
      ? table.getFilteredRowModel().rows
      : table.getRowModel().rows;
    const headers = exportableCols.map((c) => c.columnDef.header as string);
    const rows = sourceRows.map((row) => {
      const obj: Record<string, string> = {};
      exportableCols.forEach((col) => {
        const raw = row.getValue(col.id);
        obj[col.columnDef.header as string] = raw == null ? "" : String(raw);
      });
      return obj;
    });
    return { headers, rows };
  }, [table, useClientFilter]);

  const handleExcelExport = useCallback(() => {
    if (!exportFilename) return;
    const { rows } = buildExportData();
    downloadExcel(rows, exportFilename);
  }, [exportFilename, buildExportData]);

  const handlePdfExport = useCallback(() => {
    if (!exportFilename) return;
    const { headers, rows } = buildExportData();
    void downloadPdf(headers, rows, exportFilename);
  }, [exportFilename, buildExportData]);

  const totalRows = useClientFilter
    ? table.getFilteredRowModel().rows.length
    : table.getRowModel().rows.length;
  const pageStart = table.getState().pagination.pageIndex * table.getState().pagination.pageSize;
  const pageEnd = Math.min(pageStart + table.getState().pagination.pageSize, totalRows);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 sm:w-80"
              />
            </div>
            {filterControl}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalRows} kayıt
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
        <div className="flex items-center gap-2">
          {exportFilename && (
            <>
              <button
                type="button"
                onClick={handleExcelExport}
                title="Excel olarak indir"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-700/40 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
              >
                {/* Excel X icon */}
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
                  <path d="M3 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm9 0v5h5M9 13l6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                XLS
              </button>
              <button
                type="button"
                onClick={handlePdfExport}
                title="PDF olarak indir"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                {/* PDF icon */}
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/>
                  <path d="M13 3v5h5"/>
                </svg>
                PDF
              </button>
            </>
          )}
          {toolbarRight}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b-2 border-gray-200 bg-gray-50/50 dark:border-white/[0.1] dark:bg-white/[0.02]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TableCell
                      key={header.id}
                      isHeader
                      className="px-5 py-3.5 font-semibold text-gray-600 text-start text-theme-xs dark:text-gray-300"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={`flex items-center gap-1 uppercase ${
                            canSort ? "cursor-pointer transition-colors duration-200 ease-in-out hover:text-gray-700 dark:hover:text-gray-200" : "cursor-default"
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" && <AngleUpIcon className="size-3" />}
                          {sortDir === "desc" && <AngleDownIcon className="size-3" />}
                        </button>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-white/[0.08]">
            {isLoading ? (
              <TableRowSkeleton rows={8} columns={columns.length || 5} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
                  className="px-5 py-16 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-3 animate-content-in">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300 [&_svg]:size-8">
                      {emptyIcon ?? <AppIcon name="inbox" className="size-12 opacity-40" />}
                    </div>
                    <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                      {emptyMessage}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {emptyDescription}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  onClick={
                    onRowClick
                      ? (e: React.MouseEvent<HTMLTableRowElement>) => {
                          if ((e.target as HTMLElement).closest("[data-stop-row-click]")) return;
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                  className={`border-b border-gray-200 last:border-b-0 dark:border-white/[0.08] ${
                    idx % 2 === 1 ? "bg-gray-50/30 dark:bg-white/[0.015]" : ""
                  } ${
                    onRowClick
                      ? "cursor-pointer transition-colors duration-200 ease-in-out hover:bg-brand-500/5 dark:hover:bg-brand-500/10"
                      : "transition-colors duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-5 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalRows === 0 ? "0" : `${pageStart + 1}–${pageEnd}`} / {totalRows}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="h-8 rounded-lg border border-gray-300 bg-transparent px-2 text-xs text-gray-700 focus:outline-hidden dark:border-gray-700 dark:text-white/80"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / sayfa
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors duration-200 ease-in-out hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Önceki"
          >
            <AngleLeftIcon className="size-4" />
          </button>
          <span className="px-3 text-xs text-gray-700 dark:text-gray-300">
            Sayfa {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition-colors duration-200 ease-in-out hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Sonraki"
          >
            <AngleRightIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
