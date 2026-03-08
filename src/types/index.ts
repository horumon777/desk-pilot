export type ScoreAxis =
  | "focus"
  | "ergonomics"
  | "productivity"
  | "aesthetics"
  | "maintenance";

export const AXIS_LABELS: Record<ScoreAxis, string> = {
  focus: "集中力環境",
  ergonomics: "人体工学",
  productivity: "生産性機器",
  aesthetics: "審美・ブランド",
  maintenance: "習慣・メンテナンス",
};

export interface DiagnosisOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  scoreContributions: Partial<Record<ScoreAxis, number>>;
}

export interface DiagnosisQuestion {
  id: string;
  questionText: string;
  description?: string;
  targetAxes: ScoreAxis[];
  options: DiagnosisOption[];
}

export interface DiagnosisResult {
  totalScore: number;
  axisScores: Record<ScoreAxis, number>;
  diagnosis: {
    headline: string;
    strengths: string;
    weaknesses: string;
    overall: string;
  };
  answers: Record<string, string>;
  createdAt: string;
}

export type RecommendCategory =
  | "desk"
  | "chair"
  | "monitor"
  | "keyboard"
  | "mouse"
  | "lighting"
  | "audio"
  | "storage"
  | "plants"
  | "stationery"
  | "coffee"
  | "background";

export const CATEGORY_LABELS: Record<RecommendCategory, string> = {
  desk: "デスク・作業台",
  chair: "チェア",
  monitor: "モニター",
  keyboard: "キーボード",
  mouse: "マウス",
  lighting: "照明",
  audio: "スピーカー・ヘッドフォン",
  storage: "収納・整理",
  plants: "観葉植物・インテリア",
  stationery: "文具・小物",
  coffee: "コーヒー・飲み物",
  background: "背景・壁紙",
};

export const CATEGORY_ICONS: Record<RecommendCategory, string> = {
  desk: "🖥️",
  chair: "🪑",
  monitor: "🖥️",
  keyboard: "⌨️",
  mouse: "🖱️",
  lighting: "💡",
  audio: "🎧",
  storage: "📦",
  plants: "🌿",
  stationery: "✏️",
  coffee: "☕",
  background: "🎨",
};

export interface RecommendItem {
  rank: number;
  productName: string;
  brand: string;
  reason: string;
  searchQuery: string;
  priceRange: string;
  amazonUrl: string;
  isPurchased: boolean;
}

export interface PurchaseRecord {
  productName: string;
  brand: string;
  category: RecommendCategory;
  purchasedAt: string;
}

export type UserStyle =
  | "pragmatic"
  | "luxury"
  | "minimalist"
  | "techEnthusiast"
  | "balanced";

export const STYLE_LABELS: Record<
  UserStyle,
  { name: string; description: string }
> = {
  pragmatic: {
    name: "質実剛健タイプ",
    description: "コスパと実用性を重視。機能に無駄がないものを選ぶ傾向",
  },
  luxury: {
    name: "ラグジュアリー追求タイプ",
    description:
      "ブランドと品質にこだわり、所有欲を満たす選択をする傾向",
  },
  minimalist: {
    name: "ミニマリストタイプ",
    description: "必要最小限で最大効果を求める。シンプルさが美学",
  },
  techEnthusiast: {
    name: "テック追求タイプ",
    description: "最新スペックと技術革新を追い求める。新しいもの好き",
  },
  balanced: {
    name: "バランス型タイプ",
    description:
      "価格・品質・デザインのバランスを総合的に判断する",
  },
};

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export const STORAGE_KEYS = {
  DIAGNOSIS_RESULT: "deskpilot_diagnosis_result",
  DIAGNOSIS_ANSWERS: "deskpilot_diagnosis_answers",
  PURCHASE_HISTORY: "deskpilot_purchase_history",
  RECOMMEND_CACHE: "deskpilot_recommend_cache",
  USER_STYLE: "deskpilot_user_style",
  CHAT_HISTORY: "deskpilot_chat_history",
} as const;
