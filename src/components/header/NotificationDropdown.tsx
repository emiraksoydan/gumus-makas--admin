import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { auditActionLabels, useGetAuditLogsQuery } from "../../features/audit/auditApi";

const READ_IDS_KEY = "gm_admin_notif_read_ids_v1";
const LAST_READ_AT_KEY = "gm_admin_notif_last_read_at_v1";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function persistReadIds(s: Set<string>) {
  try {
    // En fazla son 500 id'yi sakla — sınırsız büyümesin.
    const arr = Array.from(s).slice(-500);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(arr));
  } catch {
    /* yut */
  }
}

function loadLastReadAt(): number {
  try {
    const raw = localStorage.getItem(LAST_READ_AT_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

function timeAgo(iso: string): string {
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec} sn önce`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} dk önce`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} sa önce`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} gün önce`;
    return date.toLocaleDateString("tr-TR");
  } catch {
    return "";
  }
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [panelTop, setPanelTop] = useState(68);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());
  const [lastReadAt, setLastReadAt] = useState<number>(() => loadLastReadAt());

  const { data, isFetching } = useGetAuditLogsQuery(
    { page: 1, pageSize: 10 },
    { pollingInterval: 60_000 }, // 1 dk'da bir tazele
  );

  const items = data?.items ?? [];

  // Okunmamış: ne tekil olarak okundu işaretlenmiş, ne de "tümünü okundu" zamanından eski.
  const isItemRead = useCallback(
    (it: { id: string; occurredAt: string }) => {
      if (readIds.has(it.id)) return true;
      if (lastReadAt > 0) {
        const t = new Date(it.occurredAt).getTime();
        if (!Number.isNaN(t) && t <= lastReadAt) return true;
      }
      return false;
    },
    [readIds, lastReadAt],
  );

  const unreadCount = useMemo(
    () => items.filter((i) => !isItemRead(i)).length,
    [items, isItemRead],
  );

  const markOneRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const now = Date.now();
    setLastReadAt(now);
    try {
      localStorage.setItem(LAST_READ_AT_KEY, String(now));
    } catch {
      /* yut */
    }
    // Görünür tüm id'leri de "okundu" setine ekle ki yeniden listede çıkarsa yine okundu görünsün.
    setReadIds((prev) => {
      const next = new Set(prev);
      items.forEach((i) => next.add(i.id));
      persistReadIds(next);
      return next;
    });
  }, [items]);

  // Sayfa yenilense bile localStorage'dan okuma davranışı zaten initial state'te yapılıyor;
  // open olduğunda taze değer için tetikle.
  useEffect(() => {
    if (!isOpen) return;
    setReadIds(loadReadIds());
    setLastReadAt(loadLastReadAt());
  }, [isOpen]);

  useEffect(() => {
    const mq = () => setIsMobile(window.innerWidth < 1024);
    mq();
    window.addEventListener("resize", mq);
    return () => window.removeEventListener("resize", mq);
  }, []);

  const toggle = () => setIsOpen((o) => !o);
  const close = () => setIsOpen(false);

  const useCenteredPanel = isMobile;

  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const updateTop = () => {
      const header = document.querySelector("header");
      if (header) {
        setPanelTop(header.getBoundingClientRect().bottom + 8);
      }
    };

    updateTop();
    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, true);
    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop, true);
    };
  }, [isOpen, isMobile]);

  const panelContent = (
    <>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-800 dark:text-white/90">Son Aktiviteler</h4>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
              {unreadCount} yeni
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand-500 hover:bg-brand-500/[0.08] dark:text-brand-400"
          >
            Tümünü okundu
          </button>
        )}
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {isFetching && items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
            <span className="ml-2">Yükleniyor...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Henüz aktivite kaydı yok.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((it) => {
              const read = isItemRead(it);
              return (
                <li
                  key={it.id}
                  onClick={() => markOneRead(it.id)}
                  className={`group relative cursor-pointer px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                    !read ? "bg-brand-500/[0.04] dark:bg-brand-500/[0.08]" : ""
                  }`}
                >
                  {!read ? (
                    <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-brand-500" />
                  ) : null}
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                        it.success ? "bg-success-500" : "bg-error-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-theme-sm ${
                          !read
                            ? "font-semibold text-gray-900 dark:text-white"
                            : "text-gray-800 dark:text-white/90"
                        }`}
                      >
                        {auditActionLabels[it.action] ?? it.actionName}
                      </p>
                      <p className="mt-0.5 truncate text-theme-xs text-gray-500 dark:text-gray-400">
                        {it.actorDisplayName ?? "Sistem / Anonim"}
                      </p>
                    </div>
                    <span className="shrink-0 text-theme-xs text-gray-400">{timeAgo(it.occurredAt)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Link
        to="/audit-logs"
        onClick={close}
        className="block border-t border-gray-100 px-4 py-2.5 text-center text-theme-sm font-medium text-brand-500 hover:bg-brand-500/[0.06] dark:border-gray-800 dark:text-brand-400"
      >
        Tümünü Gör →
      </Link>
    </>
  );

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-all duration-500 ease-in-out hover:bg-gray-100 hover:text-gray-700 hover:shadow-sm dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
        aria-label="Bildirimler"
        title="Bildirimler"
      >
        <svg
          className="fill-current"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 3.5C8.4101 3.5 5.5 6.4101 5.5 10V11.6839C5.5 12.5089 5.18519 13.3032 4.62022 13.9024L3.43898 15.1561C2.94989 15.6749 2.94989 16.4836 3.43898 17.0024C3.70046 17.2772 4.05875 17.4309 4.43248 17.4309H19.5675C19.9412 17.4309 20.2995 17.2772 20.561 17.0024C21.0501 16.4836 21.0501 15.6749 20.561 15.1561L19.3798 13.9024C18.8148 13.3032 18.5 12.5089 18.5 11.6839V10C18.5 6.4101 15.5899 3.5 12 3.5ZM14.5 18.9309C14.5 20.3116 13.3807 21.4309 12 21.4309C10.6193 21.4309 9.5 20.3116 9.5 18.9309H14.5Z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {useCenteredPanel && isOpen
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[100000] bg-gray-900/20"
                onClick={close}
                aria-hidden
              />
              <div
                className="fixed left-1/2 z-[100001] flex w-[min(360px,calc(100vw-1.5rem))] -translate-x-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900"
                style={{ top: panelTop }}
                role="dialog"
                aria-label="Bildirimler"
              >
                {panelContent}
              </div>
            </>,
            document.body,
          )
        : null}

      {!useCenteredPanel ? (
        <Dropdown
          isOpen={isOpen}
          onClose={close}
          className="!left-auto !right-0 mt-3 flex w-[min(360px,calc(100vw-1.5rem))] max-w-[360px] flex-col rounded-2xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 sm:w-[360px]"
        >
          {panelContent}
        </Dropdown>
      ) : null}
    </div>
  );
}
