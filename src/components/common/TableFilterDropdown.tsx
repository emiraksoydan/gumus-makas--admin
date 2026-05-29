import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AppIcon from "../icons/AppIcon";
import Label from "../form/Label";

export type TableFilterField =
  | {
      type: "select";
      key: string;
      label: string;
      placeholder?: string;
      multiple?: boolean;
      options: { value: string; label: string }[];
    }
  | {
      type: "toggle";
      key: string;
      label: string;
      options: { value: string; label: string }[];
    };

export type TableFilterValues = Record<string, string | string[]>;

export function countActiveFilters(
  fields: TableFilterField[],
  values: TableFilterValues,
): number {
  let n = 0;
  for (const f of fields) {
    const v = values[f.key];
    if (f.type === "select" && f.multiple) {
      if (Array.isArray(v) && v.length > 0) n += 1;
    } else if (typeof v === "string" && v !== "" && v !== "all") {
      n += 1;
    }
  }
  return n;
}

export default function TableFilterDropdown({
  fields,
  values,
  onChange,
  onApply,
  onClear,
}: {
  fields: TableFilterField[];
  values: TableFilterValues;
  onChange: (next: TableFilterValues) => void;
  onApply?: () => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const activeCount = useMemo(() => countActiveFilters(fields, values), [fields, values]);

  useEffect(() => {
    if (!open || !btnRef.current) return;

    const updatePos = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };

    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const setField = (key: string, value: string | string[]) => {
    onChange({ ...values, [key]: value });
  };

  const handleClear = () => {
    const cleared: TableFilterValues = {};
    fields.forEach((f) => {
      cleared[f.key] = f.type === "select" && f.multiple ? [] : "all";
    });
    onChange(cleared);
    onClear?.();
    setOpen(false);
  };

  const handleApply = () => {
    onApply?.();
    setOpen(false);
  };

  const panel = open ? (
    <div
      ref={panelRef}
      style={{ top: panelPos.top, right: panelPos.right }}
      className="fixed z-[100002] w-[min(320px,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Filtreler</h4>
        {activeCount > 0 ? (
          <span className="text-xs text-brand-600 dark:text-brand-400">{activeCount} aktif</span>
        ) : null}
      </div>

      <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto pr-1">
        {fields.map((field) => {
          if (field.type === "toggle") {
            const current = (values[field.key] as string) ?? "all";
            return (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {field.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField(field.key, opt.value)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        current === opt.value
                          ? "bg-brand-500 text-white"
                          : "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          const current = values[field.key];
          if (field.multiple) {
            const selected = Array.isArray(current) ? current : [];
            return (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <select
                  multiple
                  value={selected}
                  onChange={(e) => {
                    const next = Array.from(e.target.selectedOptions).map((o) => o.value);
                    setField(field.key, next);
                  }}
                  className="mt-1.5 min-h-[88px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-gray-400">Ctrl ile çoklu seçim</p>
              </div>
            );
          }

          return (
            <div key={field.key}>
              <Label>{field.label}</Label>
              <select
                value={(current as string) ?? "all"}
                onChange={(e) => setField(field.key, e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
        >
          Temizle
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 rounded-lg bg-brand-500 py-2 text-xs font-medium text-white hover:bg-brand-600"
        >
          Uygula
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition ${
          activeCount > 0
            ? "border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
            : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
        aria-label="Filtrele"
        title="Filtrele"
        aria-expanded={open}
      >
        <AppIcon name="filter" className="size-5" />
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
