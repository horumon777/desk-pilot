"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import { CATEGORY_BOOST_MAP } from "@/lib/purchase-boost";
import {
  STORAGE_KEYS,
  PurchaseRecord,
  DiagnosisResult,
  ScoreAxis,
  CATEGORY_LABELS,
  RecommendCategory,
  STYLE_LABELS,
  UserStyle,
} from "@/types";
import { Header } from "@/components/header";

function classifyStyle(purchases: PurchaseRecord[]): UserStyle {
  if (purchases.length < 3) return "balanced";

  const categories = new Set(purchases.map((p) => p.category));
  const techCategories = ["keyboard", "mouse", "monitor", "audio"];
  const aestheticCategories = ["plants", "background", "stationery"];

  const techCount = purchases.filter((p) =>
    techCategories.includes(p.category)
  ).length;
  const aestheticCount = purchases.filter((p) =>
    aestheticCategories.includes(p.category)
  ).length;

  if (categories.size <= 2 && purchases.length >= 3) return "minimalist";
  if (techCount > purchases.length * 0.5) return "techEnthusiast";
  if (aestheticCount > purchases.length * 0.4) return "luxury";
  if (purchases.length >= 5 && categories.size >= 4) return "balanced";
  return "pragmatic";
}

// --- Score Progression ---

interface ChartPoint {
  label: string;
  actualScore?: number;
  predictionScore?: number;
  event?: string;
}

interface TimelineResult {
  data: ChartPoint[];
  currentScore: number;
  predictedMonths: number | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildScoreTimeline(
  result: DiagnosisResult,
  purchases: PurchaseRecord[]
): TimelineResult {
  const axes: ScoreAxis[] = [
    "focus",
    "ergonomics",
    "productivity",
    "aesthetics",
    "maintenance",
  ];

  const data: ChartPoint[] = [];

  // --- Actual data points ---
  // Start: diagnosis
  data.push({
    label: formatDate(result.createdAt),
    actualScore: result.totalScore,
    event: "診断実施",
  });

  // Sort purchases chronologically
  const sorted = [...purchases].sort(
    (a, b) =>
      new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime()
  );

  // Replay purchases, accumulating boosts with axis cap
  const cumBoosts: Record<ScoreAxis, number> = {
    focus: 0,
    ergonomics: 0,
    productivity: 0,
    aesthetics: 0,
    maintenance: 0,
  };

  for (const p of sorted) {
    const mapping = CATEGORY_BOOST_MAP[p.category];
    if (!mapping) continue;
    cumBoosts[mapping.axis] += mapping.boost;

    let total = 0;
    for (const axis of axes) {
      total += Math.min(20, result.axisScores[axis] + cumBoosts[axis]);
    }

    data.push({
      label: formatDate(p.purchasedAt),
      actualScore: total,
      event: `${CATEGORY_LABELS[p.category]}購入`,
    });
  }

  const currentScore = data[data.length - 1].actualScore!;

  // --- Prediction data points ---
  const TARGET = 85;
  let predictedMonths: number | null = null;

  if (currentScore < 100) {
    // Calculate improvement rate
    let avgBoostPerDay: number;
    if (sorted.length > 0) {
      const diagDate = new Date(result.createdAt).getTime();
      const lastDate = new Date(
        sorted[sorted.length - 1].purchasedAt
      ).getTime();
      const daySpan = Math.max(
        1,
        (lastDate - diagDate) / (1000 * 60 * 60 * 24)
      );
      const totalBoost = currentScore - result.totalScore;
      avgBoostPerDay = totalBoost / daySpan;
    } else {
      avgBoostPerDay = 0.15;
    }
    avgBoostPerDay = Math.max(avgBoostPerDay, 0.05);

    // Bridge point: connects actual line to prediction line
    data.push({
      label: "今日",
      actualScore: currentScore,
      predictionScore: currentScore,
    });

    // Future intervals (2-week steps, 3 months)
    const today = new Date();
    const intervals = [14, 28, 42, 56, 70, 84];

    for (const days of intervals) {
      const futureDate = new Date(
        today.getTime() + days * 24 * 60 * 60 * 1000
      );
      const projected = Math.min(
        100,
        Math.round(currentScore + avgBoostPerDay * days)
      );
      data.push({
        label: `${futureDate.getMonth() + 1}/${futureDate.getDate()}`,
        predictionScore: projected,
      });
    }

    // When does target get reached?
    if (currentScore < TARGET) {
      const daysToTarget = (TARGET - currentScore) / avgBoostPerDay;
      predictedMonths = Math.round((daysToTarget / 30) * 10) / 10;
    }
  }

  return { data, currentScore, predictedMonths };
}

// Custom tooltip
/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload as ChartPoint | undefined;
  if (!point) return null;

  const score = point.actualScore ?? point.predictionScore;
  const isPredictionOnly = point.actualScore == null && point.predictionScore != null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-lg px-4 py-3 max-w-[220px]">
      <p className="text-xs text-neutral-400 mb-1">{point.label}</p>
      <p className="text-lg font-bold text-neutral-900">
        {score}
        <span className="text-sm text-neutral-400 font-normal"> / 100</span>
      </p>
      {point.event && (
        <p className="text-xs text-emerald-600 font-medium mt-1">
          {point.event}
        </p>
      )}
      {isPredictionOnly && (
        <p className="text-xs text-blue-500 font-medium mt-1">予測スコア</p>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Custom dot — purchase events get a larger green marker
/* eslint-disable @typescript-eslint/no-explicit-any */
function EventDot(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;

  // Purchase event marker
  if (payload?.event && payload.event !== "診断実施") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={8} fill="#d1fae5" stroke="#10b981" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill="#10b981" />
      </g>
    );
  }
  // Diagnosis start marker
  if (payload?.event === "診断実施") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#e5e5e5" stroke="#737373" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={2} fill="#737373" />
      </g>
    );
  }
  // Regular dot (bridge point "今日")
  return (
    <circle cx={cx} cy={cy} r={4} fill="#171717" stroke="#fff" strokeWidth={2} />
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function HistoryPage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [diagResult, setDiagResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const stored = getStorageItem<PurchaseRecord[]>(
      STORAGE_KEYS.PURCHASE_HISTORY,
      []
    );
    setPurchases(stored);

    const result = getStorageItem<DiagnosisResult | null>(
      STORAGE_KEYS.DIAGNOSIS_RESULT,
      null
    );
    setDiagResult(result);
  }, []);

  const timeline = useMemo(() => {
    if (!diagResult) return null;
    return buildScoreTimeline(diagResult, purchases);
  }, [diagResult, purchases]);

  const style = useMemo(() => classifyStyle(purchases), [purchases]);
  const styleInfo = STYLE_LABELS[style];
  const categoriesUsed = new Set(purchases.map((p) => p.category)).size;

  const handleRemove = (index: number) => {
    const updated = purchases.filter((_, i) => i !== index);
    setPurchases(updated);
    setStorageItem(STORAGE_KEYS.PURCHASE_HISTORY, updated);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
            Purchase History
          </p>
          <h1 className="text-3xl font-bold text-neutral-900">購入履歴</h1>
          <p className="text-neutral-500 text-sm mt-1">
            購入記録が増えるほど、AIの提案精度が向上します
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "購入数", value: purchases.length, unit: "件" },
            { label: "カテゴリ", value: categoriesUsed, unit: "種" },
            {
              label: "習熟度",
              value:
                purchases.length >= 5
                  ? "上級"
                  : purchases.length >= 3
                  ? "中級"
                  : "初級",
              unit: "",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 text-center"
            >
              <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stat.value}
                <span className="text-sm text-neutral-400 font-normal">
                  {stat.unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Score Progression Chart */}
        {timeline && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-neutral-400">
                  Score Progression
                </p>
                <h2 className="text-lg font-bold text-neutral-900 mt-0.5">
                  スコア推移
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-[3px] bg-neutral-900 rounded" />
                  <span className="text-[10px] text-neutral-500">実績</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="20" height="3">
                    <line
                      x1="0"
                      y1="1.5"
                      x2="20"
                      y2="1.5"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  <span className="text-[10px] text-neutral-500">予測</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={timeline.data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f5f5f5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#a3a3a3", fontSize: 10 }}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#a3a3a3", fontSize: 10 }}
                    axisLine={{ stroke: "#e5e5e5" }}
                    tickLine={false}
                    width={35}
                    ticks={[0, 20, 40, 60, 80, 100]}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine
                    y={85}
                    stroke="#f59e0b"
                    strokeDasharray="6 3"
                    strokeWidth={1}
                    label={{
                      value: "目標 85pt",
                      position: "right",
                      fill: "#f59e0b",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                  {/* Actual score line */}
                  <Line
                    type="monotone"
                    dataKey="actualScore"
                    stroke="#171717"
                    strokeWidth={2.5}
                    dot={<EventDot />}
                    activeDot={{
                      r: 5,
                      fill: "#171717",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                    isAnimationActive={true}
                    animationDuration={1200}
                  />
                  {/* Prediction line */}
                  <Line
                    type="monotone"
                    dataKey="predictionScore"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={{
                      r: 2,
                      fill: "#60a5fa",
                      stroke: "#fff",
                      strokeWidth: 1,
                    }}
                    activeDot={{
                      r: 4,
                      fill: "#60a5fa",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Prediction message */}
            {timeline.predictedMonths !== null &&
              timeline.currentScore < 85 && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-600"
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
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">
                        このまま改善を続けると
                        <span className="font-bold">
                          約{timeline.predictedMonths}ヶ月後
                        </span>
                        にスコア
                        <span className="font-bold">85点</span>
                        に到達します
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        ※ 現在の改善ペースに基づく推定値
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {timeline.currentScore >= 85 && (
              <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🏆</span>
                  </div>
                  <p className="text-sm text-emerald-800 font-medium">
                    目標スコア85点を達成済み！上位30%のデスク環境です。
                  </p>
                </div>
              </div>
            )}

            {/* Purchase event legend */}
            {purchases.length > 0 && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    購入イベント
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-neutral-200 border-2 border-neutral-500 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-neutral-500" />
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    診断開始
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Style Classification */}
        {purchases.length >= 3 && (
          <div className="bg-neutral-900 rounded-2xl p-6 text-center mb-8">
            <p className="text-[10px] text-neutral-400 font-semibold tracking-[0.3em] uppercase mb-2">
              Your Style
            </p>
            <p className="text-xl font-bold text-white">{styleInfo.name}</p>
            <p className="text-sm text-neutral-400 mt-1">
              {styleInfo.description}
            </p>
          </div>
        )}

        {/* Purchase List */}
        {purchases.length === 0 ? (
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-12 text-center space-y-4">
            <div className="text-4xl">📦</div>
            <p className="text-neutral-500">まだ購入記録がありません</p>
            <Link
              href="/recommend"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors"
            >
              おすすめを見る
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map((purchase, index) => (
              <div
                key={`${purchase.productName}-${index}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-neutral-200 px-5 py-3.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {purchase.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {
                        CATEGORY_LABELS[
                          purchase.category as RecommendCategory
                        ]
                      }
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {purchase.brand}
                    </span>
                  </div>
                </div>
                <button
                  className="text-xs text-neutral-400 hover:text-red-500 transition-colors ml-4"
                  onClick={() => handleRemove(index)}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
          <Link
            href="/recommend"
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-neutral-800 transition-colors"
          >
            おすすめランキングへ
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            ← トップに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
