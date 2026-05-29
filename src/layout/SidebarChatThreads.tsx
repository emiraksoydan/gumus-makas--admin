import { Link, useLocation } from "react-router";
import { useGetChatThreadsQuery } from "../features/chat/chatApi";
import { useSidebar } from "../context/SidebarContext";
import AppIcon from "../components/icons/AppIcon";

const MAX_THREADS = 8;

export default function SidebarChatThreads() {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const location = useLocation();
  const show = isExpanded || isHovered || isMobileOpen;

  const { data: threads = [], isLoading } = useGetChatThreadsQuery(undefined, {
    skip: !show,
  });

  if (!show) return null;

  const recent = threads.slice(0, MAX_THREADS);

  return (
    <div className="mb-4 border-t border-gray-200 pt-4 dark:border-gray-800">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Son sohbetler
        </span>
        <Link
          to="/chat"
          className="text-[10px] font-medium text-brand-500 hover:underline"
        >
          Tümü
        </Link>
      </div>
      {isLoading ? (
        <p className="px-1 text-xs text-gray-500">Yükleniyor...</p>
      ) : recent.length === 0 ? (
        <p className="px-1 text-xs text-gray-500">Sohbet yok</p>
      ) : (
        <ul className="space-y-0.5">
          {recent.map((t) => {
            const href = `/chat/${t.threadId}`;
            const active = location.pathname === href;
            return (
              <li key={t.threadId}>
                <Link
                  to={href}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition ${
                    active
                      ? "bg-brand-500/15 text-brand-600 dark:text-brand-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  }`}
                  title={t.title}
                >
                  <AppIcon name="chat" className="size-4 shrink-0 opacity-70" />
                  <span className="min-w-0 flex-1 truncate">{t.title}</span>
                  {t.unreadCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-warning-500 px-1.5 text-[9px] font-medium text-white">
                      {t.unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
