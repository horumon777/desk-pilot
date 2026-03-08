import {
  ScoreAxis,
  AXIS_LABELS,
  PurchaseRecord,
  CATEGORY_LABELS,
  RecommendCategory,
  UserProfile,
  PROFILE_FIELDS,
} from "@/types";
import { DIAGNOSIS_QUESTIONS } from "./constants";

// --- Profile context helper ---
function formatProfileContext(profile?: UserProfile | null): string {
  if (!profile) return "";

  const lines: string[] = [];

  for (const field of PROFILE_FIELDS) {
    const value = profile[field.key as keyof UserProfile];
    if (!value || value === "") continue;
    const option = field.options.find((o) => o.value === value);
    if (option) {
      lines.push(`- ${field.label}: ${option.label}`);
    }
  }

  if (lines.length === 0) return "";
  return `\n## ユーザープロフィール:\n${lines.join("\n")}`;
}

export function buildDiagnosisPrompt(
  answers: Record<string, string>,
  totalScore: number,
  axisScores: Record<ScoreAxis, number>,
  profile?: UserProfile | null
): string {
  const formattedAnswers = DIAGNOSIS_QUESTIONS.map((q) => {
    const selected = q.options.find((o) => o.id === answers[q.id]);
    return {
      question: q.questionText,
      answer: selected?.label ?? "未回答",
    };
  });

  const scoreLines = (Object.keys(axisScores) as ScoreAxis[])
    .map((axis) => `- ${AXIS_LABELS[axis]}: ${axisScores[axis]}/20`)
    .join("\n");

  const profileSection = formatProfileContext(profile);

  return `あなたはデスク環境の専門コンサルタント「DeskPilot AI」です。
20〜40代のビジネスパーソンに向けて、プロフェッショナルかつ親しみやすいトーンで話します。

以下のユーザーのデスク環境診断結果に基づいて、診断コメントを生成してください。
${profileSection}

## ユーザーの回答:
${JSON.stringify(formattedAnswers, null, 2)}

## 算出されたスコア:
- 総合スコア: ${totalScore}/100
${scoreLines}

## 出力要件:
以下のJSON形式で出力してください。他のテキストは一切含めないでください。
${profileSection ? "\nユーザーの年代・職種・デスクワーク時間・運動頻度を考慮した、パーソナライズされた診断にしてください。" : ""}

{
  "headline": "一文の診断ヘッドライン（例：「照明と椅子が集中力の最大の阻害要因です」）",
  "strengths": "強みの分析（2-3文）",
  "weaknesses": "弱点の分析と改善提案（3-4文）",
  "overall": "総合的なアドバイス（2-3文。モチベーションを高める前向きなトーンで締める）"
}`;
}

export function buildRecommendPrompt(
  answers: Record<string, string>,
  category: string,
  categoryLabel: string,
  purchaseHistory?: string[],
  userStyle?: string,
  profile?: UserProfile | null
): string {
  const formattedAnswers = DIAGNOSIS_QUESTIONS.map((q) => {
    const selected = q.options.find((o) => o.id === answers[q.id]);
    return {
      question: q.questionText,
      answer: selected?.label ?? "未回答",
    };
  });

  let context = "";
  if (purchaseHistory && purchaseHistory.length > 0) {
    context += `\n- 購入済み商品: ${purchaseHistory.join(", ")}`;
  }
  if (userStyle) {
    context += `\n- ユーザースタイル: ${userStyle}`;
  }

  // Add profile context inline
  if (profile) {
    for (const field of PROFILE_FIELDS) {
      const value = profile[field.key as keyof UserProfile];
      if (!value || value === "") continue;
      const option = field.options.find((o) => o.value === value);
      if (option) {
        context += `\n- ${field.label}: ${option.label}`;
      }
    }
  }

  return `あなたはデスク環境の専門バイヤー「DeskPilot AI」です。
日本市場で実際に購入可能な商品を推薦します。

## ユーザープロフィール:
- 診断回答: ${JSON.stringify(formattedAnswers)}${context}

## 指示:
「${categoryLabel}」カテゴリで、このユーザーに最適な商品をTOP10でランキングしてください。

## ルール:
1. 日本のAmazon.co.jpで検索可能な実在の商品名を使用すること
2. 各商品に「なぜこのユーザーにおすすめか」の個別理由を2文以内で付与すること
3. 価格帯は3,000円〜80,000円の範囲で幅広く含めること
4. ユーザーの回答内容（作業スタイル、予算感、重視項目）を反映した順位付けにすること
${purchaseHistory && purchaseHistory.length > 0 ? "5. 購入済み商品と同じブランド傾向を考慮すること" : ""}
${profile?.budgetRange ? "6. ユーザーの予算感を特に重視して価格帯を調整すること" : ""}

## 出力形式（JSON）:
{
  "items": [
    {
      "rank": 1,
      "productName": "商品名",
      "brand": "ブランド名",
      "reason": "このユーザーにおすすめの理由（2文以内）",
      "searchQuery": "Amazon検索用クエリ文字列",
      "priceRange": "¥5,000〜¥8,000"
    }
  ]
}

JSON以外のテキストは出力しないでください。`;
}

export function buildChatSystemPrompt(
  totalScore: number,
  axisScores: Record<ScoreAxis, number>,
  boostedTotalScore: number,
  boostedAxisScores: Record<ScoreAxis, number>,
  purchaseHistory: PurchaseRecord[],
  weakestAxis: ScoreAxis,
  profile?: UserProfile | null
): string {
  const scoreLines = (Object.keys(axisScores) as ScoreAxis[])
    .map(
      (axis) =>
        `- ${AXIS_LABELS[axis]}: ${boostedAxisScores[axis]}/20（診断時: ${axisScores[axis]}）`
    )
    .join("\n");

  const purchaseLines =
    purchaseHistory.length > 0
      ? purchaseHistory
          .map(
            (p) =>
              `- ${p.productName}（${p.brand}、${CATEGORY_LABELS[p.category as RecommendCategory]}）`
          )
          .join("\n")
      : "なし";

  const profileSection = formatProfileContext(profile);

  return `あなたはデスク環境改善の専門アドバイザー「DeskPilot AI」です。
プロフェッショナルかつ心に刺さる言葉で回答してください。
${profileSection}

## ユーザーの現在のスコア
- 総合スコア: ${boostedTotalScore}/100（診断時: ${totalScore}/100）
${scoreLines}
- 最も弱い軸: ${AXIS_LABELS[weakestAxis]}

## 購入済みアイテム
${purchaseLines}

## 回答ルール
1. ユーザーの弱い軸を踏まえた具体的なアドバイスを出す
${profile ? "2. ユーザーの職種・年代・運動頻度・デスクワーク時間を考慮したパーソナライズされた提案をする" : ""}
3. 商品を提案する際は、以下の形式でAmazonリンクを含める：
   [商品名](https://www.amazon.co.jp/s?k=検索クエリをURLエンコードしたもの)
   例: [BenQ ScreenBar Halo](https://www.amazon.co.jp/s?k=BenQ+ScreenBar+Halo)
4. 日本のAmazon.co.jpで購入可能な実在商品を推薦すること
5. 回答は簡潔に。1回の回答で提案する商品は最大3つまで
6. 数字やデータを使って説得力のある提案をする
7. 購入済みアイテムと重複する提案は避ける
8. マークダウン形式で回答する（見出し、箇条書き、太字などを適切に使用）
${profile?.budgetRange ? "9. ユーザーの予算感を考慮した価格帯の商品を提案すること" : ""}`;
}
