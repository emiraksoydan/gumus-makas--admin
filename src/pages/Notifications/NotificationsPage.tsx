import { useState, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ActionButton from "../../components/common/ActionButton";
import Badge from "../../components/ui/badge/Badge";
import UserAvatar from "../../components/common/UserAvatar";
import { useBroadcastNotificationMutation } from "../../features/notifications/broadcastApi";
import { useGetUsersQuery } from "../../features/users/usersApi";
import { userTypeLabels, userTypeBadgeColor } from "../../features/users/userTypeLabels";

const USER_TYPE_OPTIONS = [
  { label: "Tüm Kullanıcılar", value: null },
  { label: "Müşteriler", value: 0 },
  { label: "Serbest Berberler", value: 1 },
  { label: "Berber Salonları", value: 2 },
];

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userType, setUserType] = useState<number | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [broadcast, { isLoading }] = useBroadcastNotificationMutation();
  const { data: allUsers = [], isLoading: usersLoading } = useGetUsersQuery();

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return allUsers
      .filter((u) => !u.isBanned)
      .filter((u) => userType === null || u.userType === userType)
      .filter((u) =>
        q === "" ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(q),
      );
  }, [allUsers, userType, search]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageIds = pageUsers.map((u) => u.id);
  const allPageChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageChecked = pageIds.some((id) => selectedIds.has(id));

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePageAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageChecked) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleUserTypeChange = (value: number | null) => {
    setUserType(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const isSendingToSelected = selectedIds.size > 0;

  const handleSend = async () => {
    if (!title.trim()) {
      setErrorMsg("Başlık zorunludur.");
      return;
    }
    setErrorMsg(null);
    setResult(null);
    try {
      const payload = isSendingToSelected
        ? { title: title.trim(), body: body.trim() || undefined, userIds: [...selectedIds] }
        : { title: title.trim(), body: body.trim() || undefined, userType };
      const res = await broadcast(payload).unwrap();
      setResult(res);
      setTitle("");
      setBody("");
      clearSelection();
    } catch {
      setErrorMsg("Gönderim sırasında bir hata oluştu.");
    }
  };

  return (
    <>
      <PageMeta
        title="Bildirim Duyurusu | Gümüş Makas Admin"
        description="Toplu bildirim gönder"
      />
      <PageBreadcrumb pageTitle="Bildirim Duyurusu" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Sol — form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Bildirim Gönder
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {isSendingToSelected
              ? `${selectedIds.size} seçili kullanıcıya gönderilecek`
              : "Seçilen kullanıcı grubuna toplu bildirim gönderir."}
          </p>

          {result && (
            <div className="mb-5 rounded-xl border border-success-200 bg-success-50/60 px-4 py-3 dark:border-success-500/20 dark:bg-success-500/5">
              <p className="text-sm font-medium text-success-700 dark:text-success-400">
                Gönderim tamamlandı — {result.sent}/{result.total} kullanıcıya ulaştı
                {result.failed > 0 && `, ${result.failed} başarısız`}.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-error-200 bg-error-50/60 px-4 py-3 dark:border-error-500/20 dark:bg-error-500/5">
              <p className="text-sm text-error-600 dark:text-error-400">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Hedef kitle — sadece seçim yoksa aktif */}
            {!isSendingToSelected && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hedef Kitle
                </label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handleUserTypeChange(opt.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        userType === opt.value
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSendingToSelected && (
              <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 dark:border-brand-500/20 dark:bg-brand-500/5">
                <span className="text-sm text-brand-700 dark:text-brand-400">
                  {selectedIds.size} kullanıcı seçildi
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-gray-500 underline hover:text-gray-700 dark:text-gray-400"
                >
                  Seçimi temizle
                </button>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Başlık <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bildirim başlığı"
                maxLength={100}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:placeholder-gray-600"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{title.length}/100</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mesaj (opsiyonel)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Bildirim içeriği..."
                rows={5}
                maxLength={500}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:placeholder-gray-600"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{body.length}/500</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/[0.05]">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isSendingToSelected
                  ? `${selectedIds.size} seçili kullanıcı`
                  : userType === null
                  ? "Tüm aktif kullanıcılara gönderilecek"
                  : `Yalnızca ${USER_TYPE_OPTIONS.find((o) => o.value === userType)?.label ?? ""} grubuna`}
              </p>
              <ActionButton
                tone="primary"
                variant="solid"
                onClick={handleSend}
                disabled={isLoading || !title.trim()}
              >
                {isLoading ? "Gönderiliyor..." : "Gönder"}
              </ActionButton>
            </div>
          </div>
        </div>

        {/* Sağ — kullanıcı listesi */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
            <div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Kullanıcılar
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedIds.size > 0 ? `${selectedIds.size} seçili — ` : ""}
                {filteredUsers.length} kullanıcı
              </p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Ad, telefon ara..."
              className="w-44 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:placeholder-gray-600"
            />
          </div>

          {/* Filtre çipleri */}
          <div className="flex gap-2 border-b border-gray-100 px-5 py-3 dark:border-white/[0.05]">
            {USER_TYPE_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleUserTypeChange(opt.value)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  userType === opt.value
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {usersLoading ? (
            <div className="space-y-3 p-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-100 dark:bg-white/[0.05]" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100 dark:bg-white/[0.05]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-100 dark:bg-white/[0.05]" />
                    <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100 dark:bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              Kullanıcı bulunamadı
            </div>
          ) : (
            <>
              {/* Sayfa tümünü seç */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-2.5 dark:border-white/[0.05]">
                <input
                  type="checkbox"
                  checked={allPageChecked}
                  ref={(el) => { if (el) el.indeterminate = somePageChecked && !allPageChecked; }}
                  onChange={togglePageAll}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-brand-500"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Bu sayfadakileri seç ({pageUsers.length})
                </span>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="ml-auto text-xs text-gray-400 underline hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Tümünü temizle
                  </button>
                )}
              </div>

              <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {pageUsers.map((u) => (
                  <li
                    key={u.id}
                    className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${
                      selectedIds.has(u.id) ? "bg-brand-50/40 dark:bg-brand-500/5" : ""
                    }`}
                    onClick={() => toggleUser(u.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleUser(u.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-brand-500"
                    />
                    <UserAvatar
                      firstName={u.firstName}
                      lastName={u.lastName}
                      imageUrl={u.imageUrl ?? undefined}
                      size={32}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{u.phoneNumber}</p>
                    </div>
                    <Badge size="sm" color={userTypeBadgeColor[u.userType] ?? "info"}>
                      {userTypeLabels[u.userType]}
                    </Badge>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-white/[0.05]">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Sayfa {safePage} / {pageCount}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                    >
                      ← Önceki
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      disabled={safePage === pageCount}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                    >
                      Sonraki →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
