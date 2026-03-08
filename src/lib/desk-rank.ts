import { ScoreAxis } from "@/types";

// --- Rank Types ---
export type RankLetter = "S" | "A" | "B" | "C" | "D";

export interface DeskRank {
  rank: RankLetter;
  label: string;
  tagline: string;
  gradient: { from: string; to: string };
  textColor: string;
  bgClass: string;
}

// --- Rank Definitions ---
const RANK_DEFINITIONS: Record<RankLetter, DeskRank> = {
  S: {
    rank: "S",
    label: "伝説のデスク",
    tagline: "この環境に、死角はない。",
    gradient: { from: "#b8860b", to: "#ffd700" },
    textColor: "#ffffff",
    bgClass: "from-yellow-700 via-yellow-600 to-yellow-400",
  },
  A: {
    rank: "A",
    label: "プロのデスク",
    tagline: "あと一歩で、伝説になる。",
    gradient: { from: "#059669", to: "#34d399" },
    textColor: "#ffffff",
    bgClass: "from-emerald-700 via-emerald-600 to-emerald-400",
  },
  B: {
    rank: "B",
    label: "上級者のデスク",
    tagline: "悪くない。だが、まだ上がある。",
    gradient: { from: "#2563eb", to: "#60a5fa" },
    textColor: "#ffffff",
    bgClass: "from-blue-700 via-blue-600 to-blue-400",
  },
  C: {
    rank: "C",
    label: "発展途上のデスク",
    tagline: "可能性はある。あとは行動だけだ。",
    gradient: { from: "#d97706", to: "#fbbf24" },
    textColor: "#ffffff",
    bgClass: "from-amber-600 via-amber-500 to-amber-300",
  },
  D: {
    rank: "D",
    label: "改革が必要なデスク",
    tagline: "今日が、変わる日だ。",
    gradient: { from: "#dc2626", to: "#f87171" },
    textColor: "#ffffff",
    bgClass: "from-red-700 via-red-600 to-red-400",
  },
};

// --- Rank Lookup ---
export function getRank(totalScore: number): DeskRank {
  if (totalScore >= 90) return RANK_DEFINITIONS.S;
  if (totalScore >= 80) return RANK_DEFINITIONS.A;
  if (totalScore >= 70) return RANK_DEFINITIONS.B;
  if (totalScore >= 60) return RANK_DEFINITIONS.C;
  return RANK_DEFINITIONS.D;
}

export function getRankByLetter(letter: string): DeskRank {
  const upper = letter.toUpperCase() as RankLetter;
  return RANK_DEFINITIONS[upper] || RANK_DEFINITIONS.D;
}

// --- Sub-Scores ---
export interface SubScore {
  emoji: string;
  label: string;
  score: number; // 0-100
}

export function calculateSubScores(
  axisScores: Record<ScoreAxis, number>
): SubScore[] {
  const { focus, ergonomics, productivity, aesthetics, maintenance } =
    axisScores;

  return [
    {
      emoji: "💘",
      label: "モテデスク度",
      score: Math.round(((aesthetics * 3 + maintenance * 2) / 5) * 5),
    },
    {
      emoji: "💰",
      label: "年収アップ度",
      score: Math.round(
        ((productivity * 2 + focus * 2 + ergonomics) / 5) * 5
      ),
    },
    {
      emoji: "🎨",
      label: "クリエイティビティ",
      score: Math.round(((aesthetics * 2 + focus * 2 + maintenance) / 5) * 5),
    },
    {
      emoji: "💪",
      label: "健康寿命インパクト",
      score: Math.round(((ergonomics * 3 + maintenance * 2) / 5) * 5),
    },
  ];
}

// --- Legacy Type to Rank mapping ---
export function legacyTypeToRank(
  type: string,
  score: number
): DeskRank {
  // Old URLs used type names like "pragmatic", "luxury", etc.
  // We just compute rank from score regardless of type
  return getRank(score);
}
