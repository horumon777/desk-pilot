export type ScoreAxis =
  | "focus"
  | "ergonomics"
  | "productivity"
  | "aesthetics"
  | "maintenance";

export const AXIS_LABELS: Record<ScoreAxis, string> = {
  focus: "集中しやすさ",
  ergonomics: "カラダへの優しさ",
  productivity: "作業効率",
  aesthetics: "見た目のこだわり",
  maintenance: "整理・管理力",
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

// --- User Profile ---
export interface UserProfile {
  ageRange: string;
  gender: string;
  occupation: string;
  exerciseFrequency: string;
  deskHoursPerDay: string;
  budgetRange: string;
  updatedAt: string;
}

export const PROFILE_FIELDS = [
  {
    key: "ageRange" as const,
    label: "年代",
    icon: "🎂",
    options: [
      { value: "20s", label: "20代" },
      { value: "30s", label: "30代" },
      { value: "40s", label: "40代" },
      { value: "50s_plus", label: "50代以上" },
    ],
  },
  {
    key: "gender" as const,
    label: "性別",
    icon: "👤",
    options: [
      { value: "male", label: "男性" },
      { value: "female", label: "女性" },
      { value: "other", label: "その他" },
      { value: "prefer_not", label: "回答しない" },
    ],
  },
  {
    key: "occupation" as const,
    label: "職種",
    icon: "💼",
    options: [
      { value: "engineer", label: "エンジニア・開発" },
      { value: "designer", label: "デザイナー・クリエイティブ" },
      { value: "marketing", label: "マーケティング・企画" },
      { value: "sales", label: "営業・コンサル" },
      { value: "management", label: "経営・マネジメント" },
      { value: "freelance", label: "フリーランス" },
      { value: "student", label: "学生" },
      { value: "other", label: "その他" },
    ],
  },
  {
    key: "exerciseFrequency" as const,
    label: "運動頻度",
    icon: "🏃",
    options: [
      { value: "daily", label: "ほぼ毎日" },
      { value: "weekly", label: "週1〜3回" },
      { value: "monthly", label: "月数回程度" },
      { value: "rarely", label: "ほとんどしない" },
    ],
  },
  {
    key: "deskHoursPerDay" as const,
    label: "1日のデスクワーク時間",
    icon: "⏰",
    options: [
      { value: "under4", label: "4時間未満" },
      { value: "4to6", label: "4〜6時間" },
      { value: "6to8", label: "6〜8時間" },
      { value: "8to10", label: "8〜10時間" },
      { value: "over10", label: "10時間以上" },
    ],
  },
  {
    key: "budgetRange" as const,
    label: "デスク環境への予算感",
    icon: "💰",
    options: [
      { value: "low", label: "コスパ重視（〜1万円）" },
      { value: "mid", label: "バランス型（1〜3万円）" },
      { value: "high", label: "しっかり投資（3〜5万円）" },
      { value: "premium", label: "妥協なし（5万円〜）" },
    ],
  },
];

export const STORAGE_KEYS = {
  DIAGNOSIS_RESULT: "deskpilot_diagnosis_result",
  DIAGNOSIS_ANSWERS: "deskpilot_diagnosis_answers",
  PURCHASE_HISTORY: "deskpilot_purchase_history",
  RECOMMEND_CACHE: "deskpilot_recommend_cache",
  USER_STYLE: "deskpilot_user_style",
  CHAT_HISTORY: "deskpilot_chat_history",
  USER_PROFILE: "deskpilot_user_profile",
} as const;
