"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { getStorageItem } from "@/lib/storage";
import { buildAmazonSearchUrl } from "@/lib/amazon";
import {
  calculatePurchaseBoosts,
  PurchaseBoostResult,
} from "@/lib/purchase-boost";
import {
  STORAGE_KEYS,
  DiagnosisResult,
  AXIS_LABELS,
  ScoreAxis,
  PurchaseRecord,
} from "@/types";
import { Header } from "@/components/header";
import { toast } from "sonner";
import { getRank, calculateSubScores } from "@/lib/desk-rank";

// --- Constants ---
const AVERAGE_SCORE = 72;
const TOP_30_THRESHOLD = 85;

// --- Priority Items ---
const PRIORITY_ITEMS: Record<
  ScoreAxis,
  {
    product: string;
    brand: string;
    why: string;
    searchQuery: string;
    priceRange: string;
    scoreBoost: number;
  }
> = {
  focus: {
    product: "BenQ ScreenBar Halo",
    brand: "BenQ",
    why: "モニター上部に設置するデスクライト。目の疲れを激減させ、集中力の持続時間を劇的に伸ばす。画面への反射ゼロ。これ一つで仕事の質が変わる。",
    searchQuery: "BenQ ScreenBar Halo モニターライト",
    priceRange: "¥12,000〜¥19,000",
    scoreBoost: 8,
  },
  ergonomics: {
    product: "Herman Miller Aeron Chair Remastered",
    brand: "Herman Miller",
    why: "世界中のエグゼクティブが選ぶ、人体工学の最高峰。腰痛予防、集中力維持、10年保証。ここに投資しないのは、自分の身体を軽視している証拠だ。",
    searchQuery: "ハーマンミラー アーロンチェア リマスタード",
    priceRange: "¥178,000〜¥228,000",
    scoreBoost: 10,
  },
  productivity: {
    product: 'Dell U2723QE 27" 4K USB-C Hub Monitor',
    brand: "Dell",
    why: "USB-C一本で給電・映像・データ転送を完結。4K IPS、90W給電、デイジーチェーン対応。デスクのケーブル地獄が消え、生産性が別次元になる。",
    searchQuery: "Dell U2723QE 4K モニター USB-C",
    priceRange: "¥55,000〜¥70,000",
    scoreBoost: 9,
  },
  aesthetics: {
    product: "Orbitkey Desk Mat",
    brand: "Orbitkey",
    why: "ヴィーガンレザーの質感。磁気ケーブルホルダー内蔵。ドキュメントポケット付き。デスクに敷いた瞬間、そこは「作業台」から「コックピット」に変わる。",
    searchQuery: "Orbitkey デスクマット レザー",
    priceRange: "¥9,000〜¥13,000",
    scoreBoost: 7,
  },
  maintenance: {
    product: "サンワサプライ ケーブルトレー CB-CTERD5",
    brand: "サンワサプライ",
    why: "デスク下にクランプ固定するメッシュトレー。電源タップごと収納可能。ケーブルが消えた瞬間、デスクの印象が2段階上がる。整理の第一歩はこれだ。",
    searchQuery: "サンワサプライ ケーブルトレー クランプ式",
    priceRange: "¥3,000〜¥5,000",
    scoreBoost: 7,
  },
};

// --- Animated Components ---
function AnimatedScore({
  target,
  className,
}: {
  target: number;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target]);

  return (
    <span
      className={
        className ||
        "text-8xl md:text-[10rem] font-black tabular-nums leading-none"
      }
    >
      {current}
    </span>
  );
}

function AnimatedCounter({
  target,
  suffix = "",
  duration = 1200,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  return (
    <span>
      {current.toLocaleString()}
      {suffix}
    </span>
  );
}

// --- Helpers ---
function getProvocativeMessage(score: number) {
  if (score <= 60)
    return {
      message: "正直、このデスクは人に見せられるレベルではない。",
      sub: "だが、それを自覚した今日が変わるチャンスだ。",
    };
  if (score <= 79)
    return {
      message: "悪くはない。ただし、デキる人のデスクとは程遠い。",
      sub: "あと一歩の投資が、仕事の格を決定的に変える。",
    };
  return {
    message: "このレベルまで来たら、あとは細部が勝負だ。",
    sub: "真の差は、誰も見ていないところへのこだわりで生まれる。",
  };
}

function getWeakestAxis(scores: Record<ScoreAxis, number>) {
  let weakest: ScoreAxis = "focus";
  let minScore = Infinity;
  for (const [axis, score] of Object.entries(scores)) {
    if (score < minScore) {
      minScore = score;
      weakest = axis as ScoreAxis;
    }
  }
  return { axis: weakest, score: minScore };
}

function calculateLoss(score: number) {
  const lostRatio = Math.max(0, (100 - score) / 100);
  const hours = Math.round(lostRatio * 300);
  return { hours, money: hours * 3000 };
}

// --- Page ---
export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    const stored = getStorageItem<DiagnosisResult | null>(
      STORAGE_KEYS.DIAGNOSIS_RESULT,
      null
    );
    if (!stored) {
      router.push("/diagnose");
      return;
    }
    setResult(stored);

    const history = getStorageItem<PurchaseRecord[]>(
      STORAGE_KEYS.PURCHASE_HISTORY,
      []
    );
    setPurchases(history);
  }, [router]);

  const boost = useMemo<PurchaseBoostResult | null>(() => {
    if (!result) return null;
    return calculatePurchaseBoosts(result.axisScores, purchases);
  }, [result, purchases]);

  const analysis = useMemo(() => {
    if (!result || !boost) return null;

    const currentTotal = boost.boostedTotalScore;
    const currentScores = boost.boostedAxisScores;

    const provocation = getProvocativeMessage(currentTotal);
    const weakest = getWeakestAxis(currentScores);
    const priorityItem = PRIORITY_ITEMS[weakest.axis];
    const loss = calculateLoss(currentTotal);
    const gap = Math.max(0, TOP_30_THRESHOLD - currentTotal);
    const predictedScore = Math.min(
      100,
      currentTotal + priorityItem.scoreBoost
    );
    const rank = getRank(currentTotal);
    const subScores = calculateSubScores(currentScores);

    return {
      provocation,
      weakest,
      priorityItem,
      loss,
      gap,
      predictedScore,
      rank,
      subScores,
      currentTotal,
      currentScores,
    };
  }, [result, boost]);

  const buildShareUrl = useCallback(() => {
    if (!analysis) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      s: analysis.currentTotal.toString(),
      r: analysis.rank.rank,
      f: analysis.currentScores.focus.toString(),
      e: analysis.currentScores.ergonomics.toString(),
      p: analysis.currentScores.productivity.toString(),
      a: analysis.currentScores.aesthetics.toString(),
      m: analysis.currentScores.maintenance.toString(),
    });
    return `${origin}/share?${params.toString()}`;
  }, [analysis]);

  const handleShareX = useCallback(() => {
    if (!analysis) return;
    const shareUrl = buildShareUrl();
    const text = `デスク診断やってみた結果…\n\nスコア ${analysis.currentTotal}/100点 · ${analysis.rank.rank}ランク\n「${analysis.rank.tagline}」\n\nあなたのデスク環境は何点？👇\n#DESKAI #デスク診断`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [analysis, buildShareUrl]);

  const handleCopyLink = useCallback(async () => {
    const shareUrl = buildShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("リンクをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }, [buildShareUrl]);

  if (!result || !analysis || !boost) return null;

  const hasPurchaseBoost = boost.totalBoost > 0;

  const radarData = (Object.keys(AXIS_LABELS) as ScoreAxis[]).map((axis) => ({
    axis: AXIS_LABELS[axis],
    original: result.axisScores[axis],
    current: analysis.currentScores[axis],
    fullMark: 20,
  }));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* ========== RANK CARD ========== */}
        <div
          className="relative rounded-3xl overflow-hidden p-8 md:p-12 mb-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${analysis.rank.gradient.from}, ${analysis.rank.gradient.to})`,
          }}
        >
          {/* Background rank letter decoration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[20rem] md:text-[28rem] font-black text-white/[0.07] leading-none">
              {analysis.rank.rank}
            </span>
          </div>

          <div className="relative z-10">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/60 mb-6">
              Your Desk Score
            </p>

            <div className="flex items-baseline justify-center gap-3 mb-4">
              <AnimatedScore
                target={analysis.currentTotal}
                className="text-8xl md:text-[10rem] font-black tabular-nums text-white leading-none"
              />
              <span className="text-2xl text-white/50 font-medium">/ 100</span>
            </div>

            {hasPurchaseBoost && (
              <p className="text-white/60 text-sm mb-4">
                購入による改善{" "}
                <span className="font-bold text-white/80">
                  +{boost.totalBoost}点
                </span>
                <span className="text-white/40 ml-2">
                  （診断時 {result.totalScore}点）
                </span>
              </p>
            )}

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2.5 mb-3">
                <span className="text-2xl font-black text-white">
                  {analysis.rank.rank}ランク
                </span>
                <span className="text-white/70 text-sm">—</span>
                <span className="text-white font-bold text-sm">
                  {analysis.rank.label}
                </span>
              </div>
              <p className="text-white/70 text-sm italic">
                「{analysis.rank.tagline}」
              </p>
            </div>

            {/* Share buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={handleShareX}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Xでシェアする
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                リンクをコピー
              </button>
            </div>
          </div>
        </div>

        {/* ========== 5-AXIS TRAIT BARS ========== */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-6">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4 text-center">
            Axis Breakdown
          </p>
          <div className="space-y-3">
            {(Object.keys(AXIS_LABELS) as ScoreAxis[]).map((axis) => {
              const value = analysis.currentScores[axis];
              const original = result.axisScores[axis];
              const boosted = value > original;
              return (
                <div key={axis} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-24 text-right flex-shrink-0">
                    {AXIS_LABELS[axis]}
                  </span>
                  <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(value / 20) * 100}%`,
                        background: `linear-gradient(90deg, ${analysis.rank.gradient.from}, ${analysis.rank.gradient.to})`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-neutral-900 w-8 text-right tabular-nums">
                    {value}
                  </span>
                  {boosted && (
                    <span className="text-[10px] font-bold text-emerald-600 w-6">
                      +{value - original}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== SUB-SCORES ========== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {analysis.subScores.map((sub) => (
            <div
              key={sub.label}
              className="bg-white rounded-xl border border-neutral-200 p-4 text-center"
            >
              <p className="text-2xl mb-1">{sub.emoji}</p>
              <p className="text-2xl font-black text-neutral-900 tabular-nums">
                {sub.score}
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 leading-tight">
                {sub.label}
              </p>
            </div>
          ))}
        </div>

        {/* ========== COMPARISON BANNER ========== */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 mb-6">
          <div className="grid grid-cols-3 divide-x divide-neutral-200">
            <div className="text-center px-3">
              <p className="text-[10px] text-neutral-400 tracking-wider uppercase mb-1">
                Your Score
              </p>
              <p className="text-2xl font-bold text-neutral-900">
                {analysis.currentTotal}
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] text-neutral-400 tracking-wider uppercase mb-1">
                同年代平均
              </p>
              <p className="text-2xl font-bold text-neutral-400">
                {AVERAGE_SCORE}
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] text-neutral-400 tracking-wider uppercase mb-1">
                上位30%まで
              </p>
              <p className="text-2xl font-bold">
                {analysis.gap > 0 ? (
                  <>
                    <span className="text-red-500">+{analysis.gap}</span>
                    <span className="text-sm text-neutral-400 font-normal">
                      点
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-600">達成済</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ========== PROVOCATION ========== */}
        <div className="bg-neutral-900 rounded-2xl p-7 mb-10 text-center">
          <p className="text-lg md:text-xl font-bold text-white leading-snug">
            {analysis.provocation.message}
          </p>
          <p className="text-sm text-neutral-400 mt-3">
            {analysis.provocation.sub}
          </p>
        </div>

        {/* ========== RADAR CHART ========== */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-10">
          {hasPurchaseBoost && (
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-neutral-300 rounded" />
                <span className="text-[10px] text-neutral-400">診断時</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-neutral-900 rounded" />
                <span className="text-[10px] text-neutral-600">現在</span>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e5e5e5" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "#525252", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 20]}
                tick={{ fill: "#a3a3a3", fontSize: 10 }}
              />
              {hasPurchaseBoost && (
                <Radar
                  name="診断時"
                  dataKey="original"
                  stroke="#d4d4d4"
                  fill="#d4d4d4"
                  fillOpacity={0.08}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
              <Radar
                name="現在"
                dataKey="current"
                stroke="#171717"
                fill="#171717"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* ========== LOSS VISUALIZATION ========== */}
        <div className="bg-red-50 rounded-2xl border border-red-200 p-7 mb-10">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-red-500 mb-4">
            Estimated Annual Loss
          </p>
          <p className="text-neutral-600 text-sm leading-relaxed mb-5">
            今の環境のまま1年過ごした場合——
            <br />
            集中力の低下、姿勢の悪化、非効率な作業動線が積み重なり、
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-red-100 p-4 text-center">
              <p className="text-3xl font-black text-red-500">
                <AnimatedCounter target={analysis.loss.hours} suffix="h" />
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 tracking-wider uppercase">
                年間の集中力損失
              </p>
            </div>
            <div className="bg-white rounded-xl border border-red-100 p-4 text-center">
              <p className="text-3xl font-black text-red-500">
                ¥<AnimatedCounter target={analysis.loss.money} />
              </p>
              <p className="text-[10px] text-neutral-400 mt-1 tracking-wider uppercase">
                時給3,000円換算
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-4 text-center">
            ※ スコアと作業効率の相関から算出した推定値
          </p>
        </div>

        {/* ========== PRIORITY ITEM ========== */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-neutral-200" />
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-neutral-900 whitespace-nowrap">
              今すぐこれだけ買え
            </p>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <p className="text-center text-neutral-500 text-xs mb-5">
            最も弱い軸「
            <span className="text-neutral-900 font-semibold">
              {AXIS_LABELS[analysis.weakest.axis]}
            </span>
            」を一撃で引き上げる、最優先アイテム
          </p>

          <div className="bg-white rounded-2xl border-2 border-neutral-900 p-6 relative overflow-hidden">
            <div className="relative">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-neutral-400 tracking-wider uppercase mb-1">
                    {analysis.priorityItem.brand}
                  </p>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {analysis.priorityItem.product}
                  </h3>
                  <p className="text-neutral-900 text-sm font-semibold mt-1">
                    {analysis.priorityItem.priceRange}
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-600 leading-relaxed mb-5">
                {analysis.priorityItem.why}
              </p>

              {/* Before/After */}
              <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 mb-5">
                <p className="text-[10px] text-neutral-400 tracking-wider uppercase mb-3 text-center">
                  Score Prediction
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-neutral-400 mb-1">Before</p>
                    <p className="text-3xl font-black text-neutral-400">
                      {analysis.currentTotal}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      className="w-6 h-6 text-neutral-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <p className="text-[10px] text-neutral-900 font-bold">
                      +{analysis.priorityItem.scoreBoost}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-400 mb-1">After</p>
                    <p className="text-3xl font-black text-neutral-900">
                      {analysis.predictedScore}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={buildAmazonSearchUrl(analysis.priorityItem.searchQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-neutral-900 text-white py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-neutral-800 transition-colors"
              >
                Amazon で今すぐ見る
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ========== DIAGNOSIS TEXT ========== */}
        <div className="space-y-4 mb-12">
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-3">
              Strengths
            </h3>
            <p className="text-neutral-700 leading-relaxed text-sm">
              {result.diagnosis.strengths}
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
            <h3 className="text-orange-700 font-semibold text-xs tracking-wider uppercase mb-3">
              Improvements
            </h3>
            <p className="text-neutral-700 leading-relaxed text-sm">
              {result.diagnosis.weaknesses}
            </p>
          </div>

          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-neutral-900 font-semibold text-xs tracking-wider uppercase mb-3">
              Overall
            </h3>
            <p className="text-neutral-700 leading-relaxed text-sm">
              {result.diagnosis.overall}
            </p>
          </div>
        </div>

        {/* ========== CLOSING PROVOCATION ========== */}
        <div className="text-center mb-10 py-8 border-t border-b border-neutral-200">
          <p className="text-neutral-500 text-sm leading-relaxed">
            デスクは、キャリアの鏡だ。
            <br />
            <span className="text-neutral-900 font-semibold">
              環境を変えた者だけが、結果を変えられる。
            </span>
          </p>
        </div>

        {/* ========== ACTIONS ========== */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/recommend"
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-neutral-800 transition-colors"
          >
            全カテゴリのランキングを見る
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="/diagnose"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            もう一度診断する
          </Link>
        </div>
      </main>
    </div>
  );
}
