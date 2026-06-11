import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CompareMetricTable, {
  type CompareMetricRow,
  type CompareWinner,
} from "../../components/compare/CompareMetricTable";
import { useGetBarberStoresQuery, type BarberStore } from "../../features/barberStores/barberStoresApi";
import Label from "../../components/form/Label";
import UserAvatar from "../../components/common/UserAvatar";
import { imageUrlsFromList } from "../../utils/entityImages";

function winnerNum(left: number, right: number): CompareWinner {
  if (left === right) return "tie";
  return left > right ? "left" : "right";
}

function buildRows(left: BarberStore, right: BarberStore): CompareMetricRow[] {
  const leftServices = left.serviceOfferings?.length ?? left.offerings?.length ?? 0;
  const rightServices = right.serviceOfferings?.length ?? right.offerings?.length ?? 0;
  const pricing = (s: BarberStore) => {
    if (s.pricingType === "Percent" || s.pricingType === "1")
      return `%${s.pricingValue} komisyon`;
    if (s.pricingType === "Rent" || s.pricingType === "2")
      return `${s.pricingValue} ₺/saat kira`;
    return "—";
  };

  return [
    {
      label: "Puan",
      left: left.rating.toFixed(1),
      right: right.rating.toFixed(1),
      winner: winnerNum(left.rating, right.rating),
    },
    {
      label: "Yorum",
      left: String(left.reviewCount ?? 0),
      right: String(right.reviewCount ?? 0),
      winner: winnerNum(left.reviewCount ?? 0, right.reviewCount ?? 0),
    },
    {
      label: "Favori",
      left: String(left.favoriteCount),
      right: String(right.favoriteCount),
      winner: winnerNum(left.favoriteCount, right.favoriteCount),
    },
    {
      label: "Tamamlanan randevu",
      left: String(left.completedAppointmentCount ?? 0),
      right: String(right.completedAppointmentCount ?? 0),
      winner: winnerNum(left.completedAppointmentCount ?? 0, right.completedAppointmentCount ?? 0),
    },
    {
      label: "Toplam kazanç",
      left: `${Number(left.totalEarnings ?? 0).toLocaleString("tr-TR")} ₺`,
      right: `${Number(right.totalEarnings ?? 0).toLocaleString("tr-TR")} ₺`,
      winner: winnerNum(left.totalEarnings ?? 0, right.totalEarnings ?? 0),
    },
    {
      label: "Hizmet sayısı",
      left: String(leftServices),
      right: String(rightServices),
      winner: winnerNum(leftServices, rightServices),
    },
    {
      label: "Paket sayısı",
      left: String(left.servicePackages?.length ?? 0),
      right: String(right.servicePackages?.length ?? 0),
      winner: winnerNum(left.servicePackages?.length ?? 0, right.servicePackages?.length ?? 0),
    },
    {
      label: "Koltuk sayısı",
      left: String(left.chairs?.length ?? 0),
      right: String(right.chairs?.length ?? 0),
      winner: winnerNum(left.chairs?.length ?? 0, right.chairs?.length ?? 0),
    },
    {
      label: "Manuel berber",
      left: String(left.manuelBarbers?.length ?? 0),
      right: String(right.manuelBarbers?.length ?? 0),
      winner: winnerNum(left.manuelBarbers?.length ?? 0, right.manuelBarbers?.length ?? 0),
    },
    {
      label: "Açık mı?",
      left: left.isOpenNow ? "Açık" : "Kapalı",
      right: right.isOpenNow ? "Açık" : "Kapalı",
      winner:
        left.isOpenNow === right.isOpenNow
          ? "tie"
          : left.isOpenNow
            ? "left"
            : "right",
    },
    {
      label: "Fiyatlandırma",
      left: pricing(left),
      right: pricing(right),
      winner: "skip",
    },
  ];
}

export default function CompareStoresPage() {
  const { data: stores = [], isLoading } = useGetBarberStoresQuery();
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  const left = stores.find((s) => s.id === leftId);
  const right = stores.find((s) => s.id === rightId);
  const rows = left && right ? buildRows(left, right) : [];

  const leftWins = rows.filter((r) => r.winner === "left").length;
  const rightWins = rows.filter((r) => r.winner === "right").length;

  useEffect(() => {
    if (stores.length >= 2 && !leftId) {
      setLeftId(stores[0].id);
      setRightId(stores[1].id);
    }
  }, [stores, leftId]);

  return (
    <>
      <PageMeta title="Salon Karşılaştırma" description="Berber salonlarını karşılaştır" />
      <PageBreadcrumb pageTitle="Salon Karşılaştırma" />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03] sm:p-6">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Salonları kendi aralarında kıyaslayın (favori listesi değil, tüm kayıtlı salonlar).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Salon A</Label>
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:text-white/90"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Salon B</Label>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:text-white/90"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.storeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-gray-500">Yükleniyor...</p>
      ) : left && right ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <motion.div
              key={left.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <CompareHeroCard name={left.storeName} rating={left.rating} meta={left.addressDescription} imageList={left.imageList} />
            </motion.div>
            <motion.div
              key={right.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut", delay: 0.07 }}
            >
              <CompareHeroCard name={right.storeName} rating={right.rating} meta={right.addressDescription} imageList={right.imageList} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.14 }}
            className="mb-4 flex items-center justify-center gap-4"
          >
            <ScorePill label={left.storeName} score={leftWins} tone="left" />
            <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">VS</span>
            <ScorePill label={right.storeName} score={rightWins} tone="right" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
          >
            <CompareMetricTable
              rows={rows}
              leftLabel={left.storeName}
              rightLabel={right.storeName}
              variant="store"
            />
          </motion.div>
        </>
      ) : null}
    </>
  );
}

function CompareHeroCard({
  name,
  rating,
  meta,
  imageList,
}: {
  name: string;
  rating: number;
  meta?: string | null;
  imageList?: { id: string; imageUrl: string }[];
}) {
  const photo = imageUrlsFromList(imageList)[0];
  return (
    <div className="rounded-2xl border border-brand-500/15 bg-gradient-to-br from-brand-500/[0.06] to-white p-5 dark:from-brand-500/10 dark:to-white/[0.02]">
      <div className="flex items-center gap-3">
        {photo ? (
          <img src={photo} alt={name} className="size-14 rounded-2xl object-cover" />
        ) : (
          <UserAvatar firstName={name} size={56} />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{name}</h3>
          <p className="text-sm text-brand-600 dark:text-brand-400">★ {rating.toFixed(1)}</p>
          {meta ? <p className="mt-1 text-xs text-gray-500">{meta}</p> : null}
        </div>
      </div>
    </div>
  );
}

function ScorePill({
  label,
  score,
  tone,
}: {
  label: string;
  score: number;
  tone: "left" | "right";
}) {
  const cls =
    tone === "left"
      ? "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300"
      : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  return (
    <div className={`rounded-xl border px-4 py-2 text-center ${cls}`}>
      <p className="max-w-[140px] truncate text-xs opacity-80">{label}</p>
      <p className="text-2xl font-bold">{score}</p>
      <p className="text-[10px] uppercase tracking-wide">kriter</p>
    </div>
  );
}
