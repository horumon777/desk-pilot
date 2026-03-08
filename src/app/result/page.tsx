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

// --- Constants ---
const AVERAGE_SCORE = 72;
const TOP_30_THRESHOLD = 85;

// --- Desk Type ---
type DeskType =
  | "pragmatic"
  | "luxury"
  | "minimalist"
  | "gadgetOtaku"
  | "aspiring";

const DESK_TYPES: Record<
  DeskType,
  { name: string; description: string; weakness: string }
> = {
  pragmatic: {
    name: "質実剛健型",
    description:
      "機能と効率を何より重視する、本質主義者。見た目より中身。道具は使い倒してこそ価値がある——そんな信念がデスクに表れている。",
    weakness:
      "「見た目への投資」を後回しにしがち。空間の美しさは集中力に直結する。",
  },
  luxury: {
    name: "ラグジュアリー型",
    description:
      "質感、ブランド、デザイン——五感を満たす空間でこそ、最高のパフォーマンスが出る。所有する喜びが仕事のモチベーションを底上げする。",
    weakness:
      "実用性より所有欲が先行することがある。本当に必要な機能か、冷静な再考を。",
  },
  minimalist: {
    name: "ミニマリスト型",
    description:
      "少数精鋭。余計なものを排除し、本当に必要なものだけで戦う。引き算の美学がデスクに宿っている。",
    weakness:
      "「足りない」を「ミニマル」と混同していないか。攻めの投資も時には必要だ。",
  },
  gadgetOtaku: {
    name: "ガジェットオタク型",
    description:
      "最新テクノロジーとスペックに目がない。デスクは実験場であり、進化し続ける司令塔だ。",
    weakness:
      "ケーブルと周辺機器の管理が追いついていない。環境整備が次のレベルへの鍵。",
  },
  aspiring: {
    name: "上昇志向型",
    description:
      "今はまだ途上。だが、理想のデスク環境を明確にイメージし、一歩ずつ投資を重ねている。ポテンシャルは最も高い。",
    weakness: "何から手をつけるか迷いがち。まず一点突破で最大効果を狙え。",
  },
};

function classifyDeskType(
  scores: Record<ScoreAxis, number>,
  totalScore: number
): DeskType {
  const entries = Object.entries(scores) as [ScoreAxis, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const highest = sorted[0][0];
  const lowest = sorted[sorted.length - 1][0];

  if (totalScore <= 55) return "aspiring";
  if (highest === "aesthetics") return "luxury";
  if (highest === "maintenance") return "minimalist";
  if (
    (highest === "productivity" || highest === "focus") &&
    lowest === "maintenance"
  )
    return "gadgetOtaku";
  if (
    (highest === "productivity" || highest === "focus") &&
    lowest === "aesthetics"
  )
    return "pragmatic";
  if (highest === "ergonomics" && lowest === "aesthetics") return "pragmatic";
  if (highest === "ergonomics") return "luxury";
  if (highest === "productivity") return "pragmatic";
  if (highest === "focus") return "gadgetOtaku";
  return "aspiring";
}

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
    why: "世界中のエグゼクティブが選ぶ、人体工学の最高峰。腰痛予防、集中力維持、10年保証。ここに投資しない男は、自分の身体を舐めている。",
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
function AnimatedScore({ target }: { target: number }) {
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
    <span className="text-8xl md:text-[10rem] font-black tabular-nums text-neutral-900 leading-none">
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
      message: "悪くはない。ただし、デキる男のデスクとは程遠い。",
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

    // Use boosted scores for current analysis
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
    const deskType = classifyDeskType(currentScores, currentTotal);
    const deskTypeInfo = DESK_TYPES[deskType];

    return {
      provocation,
      weakest,
      priorityItem,
      loss,
      gap,
      predictedScore,
      deskType,
      deskTypeInfo,
      currentTotal,
      currentScores,
    };
  }, [result, boost]);

  const buildShareUrl = useCallback(() => {
    if (!analysis) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      s: analysis.currentTotal.toString(),
      t: analysis.deskType,
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
    const text = `俺のデスクタイプは「${analysis.deskTypeInfo.name}」だった。\nスコア: ${analysis.currentTotal}/100点\n\n#DESKAI #デスク診断`;
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

  // Radar data: original + current (boosted)
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
        {/* ========== SCORE ========== */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-400 mb-6">
            Your Desk Score
          </p>
          <div className="flex items-baseline justify-center gap-3">
            <AnimatedScore target={analysis.currentTotal} />
            <span className="text-2xl text-neutral-400 font-medium">
              / 100
            </span>
          </div>
          {hasPurchaseBoost && (
            <p className="text-emerald-600 text-sm font-medium mt-3">
              購入による改善{" "}
              <span className="font-bold">+{boost.totalBoost}点</span>
              <span className="text-neutral-400 ml-2">
                （診断時 {result.totalScore}点）
              </span>
            </p>
          )}
        </div>

        {/* ========== DESK TYPE ========== */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(180,140,60,0.04),_transparent_70%)] pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-3">
              Your Desk Type
            </p>
            <h2
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ color: "#b08d3e" }}
            >
              {analysis.deskTypeInfo.name}
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed max-w-md mx-auto mb-4">
              {analysis.deskTypeInfo.description}
            </p>
            <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2 mb-6">
              <span className="text-xs text-neutral-400">
                このタイプの弱点：
              </span>
              <span className="text-xs text-neutral-700 font-medium">
                {analysis.deskTypeInfo.weakness}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={handleShareX}
                className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Xでシェアする
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                リンクをコピー
              </button>
            </div>
          </div>
        </div>

        {/* ========== PURCHASE IMPACT ========== */}
        {hasPurchaseBoost && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  購入アイテムによるスコア改善
                </p>
                <p className="text-xs text-emerald-600">
                  診断時 {result.totalScore}点 → 現在{" "}
                  {analysis.currentTotal}点（
                  <span className="font-bold">+{boost.totalBoost}点</span>）
                </p>
              </div>
            </div>

            {/* Per-axis boost bars */}
            <div className="space-y-2 mb-4">
              {(Object.keys(AXIS_LABELS) as ScoreAxis[]).map((axis) => {
                const axisBoost = boost.boostsByAxis[axis];
                if (axisBoost === 0) return null;
                const original = result.axisScores[axis];
                const current = analysis.currentScores[axis];
                return (
                  <div key={axis} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 w-24 text-right flex-shrink-0">
                      {AXIS_LABELS[axis]}
                    </span>
                    <div className="flex-1 h-2 bg-emerald-100 rounded-full overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 bg-neutral-300 rounded-full"
                        style={{ width: `${(original / 20) * 100}%` }}
                      />
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                        style={{ width: `${(current / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 w-12 flex-shrink-0">
                      +{axisBoost}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Individual item messages */}
            <div className="space-y-1.5 pt-3 border-t border-emerald-200">
              {boost.itemBoosts.map((item, i) => (
                <div
                  key={`${item.productName}-${i}`}
                  className="flex items-center gap-2"
                >
                  <span className="text-emerald-500 text-xs">✓</span>
                  <p className="text-xs text-emerald-800">
                    <span className="font-semibold">{item.productName}</span>
                    を買ったことで
                    <span className="font-bold">{item.axisLabel}</span>
                    スコアが
                    <span className="font-bold text-emerald-700">
                      +{item.boost}点
                    </span>
                    上がりました
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
