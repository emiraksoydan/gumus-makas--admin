import { useMemo, useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import AppIcon from "../../components/icons/AppIcon";
import type { AppIconName } from "../../components/icons/app-icons";
import EntityDetailDrawer from "../../components/common/EntityDetailDrawer";
import {
  MEDIA_CATEGORIES,
  useGetMediaFilesQuery,
  useGetMediaStatsQuery,
  type AdminMediaFile,
} from "../../features/media/adminMediaApi";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { formatBytes } from "../../utils/formatBytes";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function ownerCode(n?: string | number | null) {
  if (n == null || n === "") return null;
  const s = String(n);
  return s.startsWith("#") ? s : `#${s}`;
}

const KIND_ICONS: Record<string, { icon: AppIconName; color: string; bg: string }> = {
  image: { icon: "image", color: "text-success-500", bg: "bg-success-500/[0.08]" },
  video: { icon: "video", color: "text-theme-pink-500", bg: "bg-theme-pink-500/[0.08]" },
  audio: { icon: "audio", color: "text-blue-light-500", bg: "bg-blue-500/[0.08]" },
  file: { icon: "file", color: "text-warning-500", bg: "bg-warning-500/[0.08]" },
};

function MediaKindIcon({ kind }: { kind: string }) {
  const cfg = KIND_ICONS[kind] ?? KIND_ICONS.file;
  return (
    <div
      className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}
    >
      <AppIcon name={cfg.icon} className="size-6" />
    </div>
  );
}

function MediaPreview({
  file,
  large,
  interactive,
}: {
  file: AdminMediaFile;
  large?: boolean;
  /** Kart içinde oynatıcıya tıklanınca önizleme açılmasın */
  interactive?: boolean;
}) {
  const src = resolveMediaUrl(file.mediaUrl);
  if (!src) return null;
  const h = large ? "max-h-[50vh]" : "h-36";
  const stopBubble = interactive
    ? (e: SyntheticEvent) => e.stopPropagation()
    : undefined;
  if (file.mediaKind === "image")
    return (
      <img src={src} alt={file.fileName ?? ""} className={`${h} w-full object-contain bg-gray-50 dark:bg-black/20`} />
    );
  if (file.mediaKind === "audio")
    return (
      <div
        className={`flex ${h} flex-col items-center justify-center gap-2 bg-gray-50 px-3 dark:bg-white/[0.03]`}
        onClick={stopBubble}
        onKeyDown={stopBubble}
        role={interactive ? "presentation" : undefined}
      >
        <AppIcon name="audio" className="size-10 text-brand-500" />
        <audio src={src} controls className="w-full max-w-md" preload="metadata" />
      </div>
    );
  if (file.mediaKind === "video")
    return (
      <video
        src={src}
        controls
        preload="metadata"
        className={`${h} w-full object-contain bg-black/80`}
        onClick={stopBubble}
      />
    );
  return (
    <div className={`flex ${h} flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-white/[0.03]`}>
      <AppIcon name="file" className="size-10 text-gray-400" />
      <span className="px-2 text-center text-xs text-gray-500">{file.fileName ?? "Dosya"}</span>
    </div>
  );
}

export default function FileManagerPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<AdminMediaFile | null>(null);
  const pageSize = 12;

  const { data: stats, isLoading: statsLoading } = useGetMediaStatsQuery();
  const { data, isLoading, isFetching, error, refetch } = useGetMediaFilesQuery({
    category,
    search: appliedSearch,
    page,
    pageSize,
  });
  const { data: recentData } = useGetMediaFilesQuery({
    category: "all",
    search: "",
    page: 1,
    pageSize: 8,
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.total ?? 0) / pageSize)),
    [data?.total],
  );

  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    stats?.categories.forEach((c) => map.set(c.categoryId, c.count));
    return map;
  }, [stats?.categories]);

  const folderCategories = useMemo(
    () => MEDIA_CATEGORIES.filter((c) => c.id !== "all"),
    [],
  );

  const folderBarLabels = useMemo(
    () =>
      folderCategories.map(
        (c) => stats?.categories.find((s) => s.categoryId === c.id)?.label ?? c.label,
      ),
    [folderCategories, stats?.categories],
  );

  const folderBarCounts = useMemo(
    () =>
      folderCategories.map((c) => categoryCountMap.get(c.id) ?? 0),
    [folderCategories, categoryCountMap],
  );

  const donutOptions: ApexOptions = useMemo(
    () => ({
      chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
      labels: stats?.categories.map((c) => c.label) ?? [],
      colors: ["#9b8afb", "#fd853a", "#fdb022", "#32d583", "#465fff", "#ee46bc"],
      legend: { position: "bottom", fontFamily: "Outfit, sans-serif" },
      dataLabels: { enabled: false },
      // Donut/pie tooltip'i tema renklerini otomatik almıyordu (koyu temada
      // siyah zemin + koyu yazı = okunmuyordu). Tema duyarlı özel tooltip.
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, w }) => {
          const isDark = document.documentElement.classList.contains("dark");
          const fg = isDark ? "#ffffff" : "#1d2939";
          const sub = isDark ? "#98a2b3" : "#475467";
          const label = String(w.globals.labels?.[seriesIndex] ?? "");
          const value = Number(series[seriesIndex] ?? 0);
          const total = (series as number[]).reduce((a, b) => a + b, 0);
          const pct = total ? Math.round((value / total) * 100) : 0;
          const color = w.globals.colors?.[seriesIndex] ?? "#465fff";
          return (
            `<div style="padding:6px 10px;color:${fg};font-size:12px;font-family:Outfit,sans-serif;line-height:1.4;">` +
            `<div style="display:flex;align-items:center;gap:6px;font-weight:600;">` +
            `<span style="width:8px;height:8px;border-radius:9999px;background:${color};display:inline-block;"></span>` +
            `${label}</div>` +
            `<div style="color:${sub};margin-top:2px;">${value} dosya · %${pct}</div>` +
            `</div>`
          );
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Toplam",
                fontSize: "13px",
                formatter: () => String(stats?.totalFiles ?? 0),
              },
            },
          },
        },
      },
    }),
    [stats],
  );

  const donutSeries = useMemo(
    () => stats?.categories.map((c) => c.count) ?? [],
    [stats],
  );

  const folderBarOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        fontFamily: "Outfit, sans-serif",
        toolbar: { show: false },
        events: {
          dataPointSelection: (_e, _ctx, config) => {
            const cat = folderCategories[config.dataPointIndex];
            if (cat) {
              setCategory(cat.id);
              setPage(1);
            }
          },
        },
      },
      colors: ["#465fff"],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: "68%",
        },
      },
      dataLabels: { enabled: true, formatter: (val) => `${val}` },
      xaxis: { categories: folderBarLabels },
      grid: { padding: { left: 8, right: 16 } },
      tooltip: { y: { formatter: (val) => `${val} dosya` } },
    }),
    [folderBarLabels, folderCategories],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setPage(1);
  };

  const mediaTypeCards = [
    { label: "Görseller", count: stats?.imageCount ?? 0, kind: "image", size: stats?.imageSizeBytes },
    { label: "Videolar", count: stats?.videoCount ?? 0, kind: "video", size: stats?.videoSizeBytes },
    { label: "Sesler", count: stats?.audioCount ?? 0, kind: "audio", size: stats?.audioSizeBytes },
    { label: "Belgeler", count: stats?.fileCount ?? 0, kind: "file", size: stats?.fileSizeBytes },
  ];

  const hasSizeInfo =
    (stats?.totalSizeBytes ?? 0) > 0 ||
    mediaTypeCards.some((c) => (c.size ?? 0) > 0);

  return (
    <>
      <PageMeta title="Dosya Yöneticisi | Gümüş Makas Admin" description="Tüm medya dosyaları" />
      <PageBreadcrumb pageTitle="Dosya Yöneticisi" />

      {error ? (
        <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-600">
          Dosyalar yüklenemedi.{" "}
          <button type="button" onClick={() => refetch()} className="underline">
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-6">
        {/* Tüm medya — özet kartlar */}
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:pl-6 sm:pr-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Tüm Medya</h3>
                {hasSizeInfo && (
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    Toplam {stats?.totalFiles ?? 0} dosya · {formatBytes(stats?.totalSizeBytes)}
                  </p>
                )}
              </div>
              <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <AppIcon
                    name="search"
                    className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ara..."
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 xl:w-[300px]"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 sm:w-auto"
                >
                  <AppIcon name="search" className="size-5" />
                  Ara
                </button>
              </form>
            </div>
            <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
                {mediaTypeCards.map((card) => (
                  <div
                    key={card.kind}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5"
                  >
                    <div className="flex items-center gap-4">
                      <MediaKindIcon kind={card.kind} />
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                          {card.label}
                        </h4>
                        <span className="block text-sm text-gray-500 dark:text-gray-400">
                          {statsLoading ? "…" : `${card.count} dosya`}
                        </span>
                        {hasSizeInfo && (
                          <span className="mt-0.5 block text-xs font-medium text-brand-500">
                            {statsLoading ? "" : formatBytes(card.size)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        Toplam
                      </span>
                      <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
                        {stats?.totalFiles ? Math.round((card.count / stats.totalFiles) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Klasörler (çubuk) + dağılım (pasta) — aynı yükseklik */}
        <div className="col-span-12 grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 xl:col-span-7">
            <div className="flex h-full min-h-[380px] flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Klasörler</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Kategori başına dosya sayısı — çubuğa tıklayarak filtreleyin
                </p>
                <div className="mt-4 max-w-md">
                  <Label>Klasör / kategori</Label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white/90"
                  >
                    {MEDIA_CATEGORIES.map((c) => {
                      const count =
                        c.id === "all" ? stats?.totalFiles ?? 0 : categoryCountMap.get(c.id) ?? 0;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.label} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center p-4 sm:p-6">
                {statsLoading ? (
                  <p className="py-12 text-center text-sm text-gray-500">Grafik yükleniyor...</p>
                ) : (
                  <Chart
                    options={folderBarOptions}
                    series={[{ name: "Dosya", data: folderBarCounts }]}
                    type="bar"
                    height={Math.max(260, folderCategories.length * 44)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5">
            <div className="flex h-full min-h-[380px] flex-col rounded-2xl border border-gray-200 bg-white px-4 pt-6 pb-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Dağılım</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tüm kategorilerin oransal payı ({stats?.totalFiles ?? 0} dosya)
              </p>
              <div className="flex flex-1 flex-col items-center justify-center">
                {statsLoading || !donutSeries.length ? (
                  <p className="py-12 text-sm text-gray-500">Grafik yükleniyor...</p>
                ) : (
                  <Chart
                    options={donutOptions}
                    series={donutSeries}
                    type="donut"
                    height={300}
                    width="100%"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seçili klasör — kart grid */}
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-white/[0.05] sm:px-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {MEDIA_CATEGORIES.find((c) => c.id === category)?.label ?? "Tüm dosyalar"}
              </h3>
              <span className="text-xs text-gray-500">
                Toplam <strong>{data?.total ?? 0}</strong> dosya
              </span>
            </div>
            <div className="p-4 sm:p-6">
              {isLoading || isFetching ? (
                <div className="py-16 text-center text-sm text-gray-500">Yükleniyor...</div>
              ) : !data?.items.length ? (
                <div className="py-16 text-center text-sm text-gray-500">Dosya bulunamadı.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {data.items.map((file) => (
                    <div
                      key={`${file.category}-${file.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => setPreview(file)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setPreview(file);
                        }
                      }}
                      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 text-left transition hover:border-brand-300 hover:shadow-md dark:border-white/[0.06]"
                    >
                      <MediaPreview file={file} interactive />
                      <div className="space-y-1 p-3">
                        <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                          {file.fileName ?? file.categoryLabel}
                        </p>
                        <p className="text-[11px] text-brand-500">{file.categoryLabel}</p>
                        {file.ownerName && (
                          <p className="truncate text-[11px] text-gray-600 dark:text-gray-300">
                            {file.ownerName}
                            {ownerCode(file.ownerNumber) ? ` · ${ownerCode(file.ownerNumber)}` : ""}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400">{fmtDate(file.createdAt)}</p>
                          {(file.sizeBytes ?? 0) > 0 && (
                            <p className="text-[10px] text-gray-400">{formatBytes(file.sizeBytes)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Sayfa {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-gray-700"
                  >
                    Önceki
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs disabled:opacity-50 dark:border-gray-700"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Son dosyalar tablosu */}
        <div className="col-span-12">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between px-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Son Dosyalar</h3>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-t border-gray-200 dark:border-gray-800">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Dosya</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Kategori</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Gönderen</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tarih</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentData?.items ?? []).map((file) => (
                    <tr key={`${file.category}-${file.id}`} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          {/* Görsel dosyalar için küçük thumbnail, diğerleri için ikon */}
                          {file.mediaKind === "image" && resolveMediaUrl(file.mediaUrl) ? (
                            <img
                              src={resolveMediaUrl(file.mediaUrl)!}
                              alt={file.fileName ?? ""}
                              className="h-9 w-9 shrink-0 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${(KIND_ICONS[file.mediaKind] ?? KIND_ICONS.file).bg}`}>
                              <AppIcon
                                name={(KIND_ICONS[file.mediaKind] ?? KIND_ICONS.file).icon}
                                className={`size-4 ${(KIND_ICONS[file.mediaKind] ?? KIND_ICONS.file).color}`}
                              />
                            </div>
                          )}
                          <span className="max-w-[180px] truncate">
                            {file.fileName ?? file.categoryLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                        {file.categoryLabel}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                        <div className="flex flex-col leading-tight">
                          <span>{file.senderDisplayName?.trim() || file.ownerName?.trim() || "—"}</span>
                          {file.ownerName?.trim() &&
                          file.ownerName.trim() !== file.senderDisplayName?.trim() ? (
                            <span className="text-[11px] text-gray-500 dark:text-gray-500">
                              {file.ownerName}
                              {ownerCode(file.ownerNumber) ? ` · ${ownerCode(file.ownerNumber)}` : ""}
                            </span>
                          ) : ownerCode(file.ownerNumber) ? (
                            <span className="text-[11px] text-gray-500 dark:text-gray-500">
                              {ownerCode(file.ownerNumber)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-400">
                        {fmtDate(file.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setPreview(file)}
                          className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                        >
                          <AppIcon name="eye" className="size-5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <EntityDetailDrawer
        isOpen={!!preview}
        onClose={() => setPreview(null)}
        title={preview?.fileName ?? preview?.categoryLabel ?? "Dosya"}
        subtitle={preview?.categoryLabel}
        widthClass="max-w-2xl"
      >
        {preview && (
          <>
            <div className="mb-4 overflow-hidden rounded-xl border dark:border-white/[0.06]">
              <MediaPreview file={preview} large />
            </div>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Görseller görüntülenir; ses ve video dosyaları yerleşik oynatıcı ile dinlenip izlenebilir.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {preview.threadId && (
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    navigate(`/chat/${preview.threadId}`);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-600"
                >
                  <AppIcon name="chat" className="size-4" />
                  Sohbete git
                </button>
              )}
              {resolveMediaUrl(preview.mediaUrl) && (
                <a
                  href={resolveMediaUrl(preview.mediaUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700"
                >
                  <AppIcon name="link" className="size-4" />
                  Yeni sekmede aç
                </a>
              )}
            </div>
          </>
        )}
      </EntityDetailDrawer>
    </>
  );
}
