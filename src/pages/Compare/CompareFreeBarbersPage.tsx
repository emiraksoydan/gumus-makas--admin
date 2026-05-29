import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import CompareMetricTable, {
  type CompareMetricRow,
  type CompareWinner,
} from "../../components/compare/CompareMetricTable";
import {
  useGetFreeBarbersQuery,
  type FreeBarberAdmin,
} from "../../features/freeBarbers/freeBarbersApi";
import Label from "../../components/form/Label";
import UserAvatar from "../../components/common/UserAvatar";

function winnerNum(left: number, right: number): CompareWinner {
  if (left === right) return "tie";
  return left > right ? "left" : "right";
}

function buildRows(left: FreeBarberAdmin, right: FreeBarberAdmin): CompareMetricRow[] {
  const leftServices = left.offerings?.length ?? 0;
  const rightServices = right.offerings?.length ?? 0;

  return [
    {
      label: "Puan",
      left: left.rating.toFixed(1),
      right: right.rating.toFixed(1),
      winner: winnerNum(left.rating, right.rating),
    },
    {
      label: "Yorum",
      left: String(left.reviewCount),
      right: String(right.reviewCount),
      winner: winnerNum(left.reviewCount, right.reviewCount),
    },
    {
      label: "Favori",
      left: String(left.favoriteCount),
      right: String(right.favoriteCount),
      winner: winnerNum(left.favoriteCount, right.favoriteCount),
    },
    {
      label: "Hizmet sayısı",
      left: String(leftServices),
      right: String(rightServices),
      winner: winnerNum(leftServices, rightServices),
    },
    {
      label: "Müsaitlik",
      left: left.isAvailable ? "Müsait" : "Meşgul",
      right: right.isAvailable ? "Müsait" : "Meşgul",
      winner:
        left.isAvailable === right.isAvailable
          ? "tie"
          : left.isAvailable
            ? "left"
            : "right",
    },
  ];
}

export default function CompareFreeBarbersPage() {
  const { data: barbers = [], isLoading } = useGetFreeBarbersQuery();
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  const left = barbers.find((b) => b.id === leftId);
  const right = barbers.find((b) => b.id === rightId);
  const rows = left && right ? buildRows(left, right) : [];
  const leftWins = rows.filter((r) => r.winner === "left").length;
  const rightWins = rows.filter((r) => r.winner === "right").length;

  useEffect(() => {
    if (barbers.length >= 2 && !leftId) {
      setLeftId(barbers[0].id);
      setRightId(barbers[1].id);
    }
  }, [barbers, leftId]);

  return (
    <>
      <PageMeta title="Serbest Berber Karşılaştırma" description="Serbest berberleri karşılaştır" />
      <PageBreadcrumb pageTitle="Serbest Berber Karşılaştırma" />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03] sm:p-6">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Serbest berberleri kendi aralarında kıyaslayın.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Berber A</Label>
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:text-white/90"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Berber B</Label>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:text-white/90"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.fullName}
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
              <HeroCard name={left.fullName} rating={left.rating} available={left.isAvailable} />
            </motion.div>
            <motion.div
              key={right.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: "easeOut", delay: 0.07 }}
            >
              <HeroCard name={right.fullName} rating={right.rating} available={right.isAvailable} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut", delay: 0.14 }}
            className="mb-4 flex items-center justify-center gap-4"
          >
            <ScorePill label={left.fullName} score={leftWins} />
            <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">VS</span>
            <ScorePill label={right.fullName} score={rightWins} variant="right" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
          >
            <CompareMetricTable
              rows={rows}
              leftLabel={left.fullName}
              rightLabel={right.fullName}
              variant="freebarber"
            />
          </motion.div>
        </>
      ) : null}
    </>
  );
}

function HeroCard({
  name,
  rating,
  available,
}: {
  name: string;
  rating: number;
  available: boolean;
}) {
  const parts = name.split(" ");
  return (
    <div className="rounded-2xl border border-pink-500/15 bg-gradient-to-br from-pink-500/[0.06] to-white p-5 dark:from-pink-500/10 dark:to-white/[0.02]">
      <div className="flex items-center gap-3">
        <UserAvatar firstName={parts[0]} lastName={parts.slice(1).join(" ")} size={56} />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{name}</h3>
          <p className="text-sm text-pink-600 dark:text-pink-400">★ {rating.toFixed(1)}</p>
          <p className="mt-1 text-xs text-gray-500">{available ? "Müsait" : "Meşgul"}</p>
        </div>
      </div>
    </div>
  );
}

function ScorePill({
  label,
  score,
  variant = "left",
}: {
  label: string;
  score: number;
  variant?: "left" | "right";
}) {
  const cls =
    variant === "right"
      ? "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300"
      : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
  return (
    <div className={`rounded-xl border px-4 py-2 text-center ${cls}`}>
      <p className="max-w-[140px] truncate text-xs opacity-80">{label}</p>
      <p className="text-2xl font-bold">{score}</p>
    </div>
  );
}
