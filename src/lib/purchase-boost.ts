import { ScoreAxis, RecommendCategory, PurchaseRecord, AXIS_LABELS } from "@/types";

/**
 * Maps each product category to the score axis it boosts and by how much.
 * Axis scores are 0–20, so boosts are calibrated accordingly.
 */
export const CATEGORY_BOOST_MAP: Record<
  RecommendCategory,
  { axis: ScoreAxis; boost: number }
> = {
  desk: { axis: "productivity", boost: 3 },
  chair: { axis: "ergonomics", boost: 4 },
  monitor: { axis: "productivity", boost: 3 },
  keyboard: { axis: "productivity", boost: 2 },
  mouse: { axis: "productivity", boost: 2 },
  lighting: { axis: "focus", boost: 3 },
  audio: { axis: "focus", boost: 2 },
  storage: { axis: "maintenance", boost: 3 },
  plants: { axis: "aesthetics", boost: 2 },
  stationery: { axis: "aesthetics", boost: 1 },
  coffee: { axis: "focus", boost: 1 },
  background: { axis: "aesthetics", boost: 2 },
};

export interface ItemBoost {
  productName: string;
  category: RecommendCategory;
  axis: ScoreAxis;
  axisLabel: string;
  boost: number;
}

export interface PurchaseBoostResult {
  /** Total boost per axis from all purchases */
  boostsByAxis: Record<ScoreAxis, number>;
  /** Original scores + boosts, capped at 20 per axis */
  boostedAxisScores: Record<ScoreAxis, number>;
  /** Sum of boosted axis scores */
  boostedTotalScore: number;
  /** Total score increase (boosted - original) */
  totalBoost: number;
  /** Per-item boost details */
  itemBoosts: ItemBoost[];
}

export function calculatePurchaseBoosts(
  originalAxisScores: Record<ScoreAxis, number>,
  purchases: PurchaseRecord[]
): PurchaseBoostResult {
  const boostsByAxis: Record<ScoreAxis, number> = {
    focus: 0,
    ergonomics: 0,
    productivity: 0,
    aesthetics: 0,
    maintenance: 0,
  };

  const itemBoosts: ItemBoost[] = [];

  for (const purchase of purchases) {
    const mapping = CATEGORY_BOOST_MAP[purchase.category];
    if (!mapping) continue;

    boostsByAxis[mapping.axis] += mapping.boost;
    itemBoosts.push({
      productName: purchase.productName,
      category: purchase.category,
      axis: mapping.axis,
      axisLabel: AXIS_LABELS[mapping.axis],
      boost: mapping.boost,
    });
  }

  const boostedAxisScores = {} as Record<ScoreAxis, number>;
  for (const axis of Object.keys(originalAxisScores) as ScoreAxis[]) {
    boostedAxisScores[axis] = Math.min(
      20,
      originalAxisScores[axis] + boostsByAxis[axis]
    );
  }

  const originalTotal = Object.values(originalAxisScores).reduce(
    (sum, v) => sum + v,
    0
  );
  const boostedTotalScore = Object.values(boostedAxisScores).reduce(
    (sum, v) => sum + v,
    0
  );

  return {
    boostsByAxis,
    boostedAxisScores,
    boostedTotalScore,
    totalBoost: boostedTotalScore - originalTotal,
    itemBoosts,
  };
}

/**
 * Get the boost info for a single category (used in recommend page toasts).
 */
export function getCategoryBoostInfo(category: RecommendCategory): {
  axis: ScoreAxis;
  axisLabel: string;
  boost: number;
} {
  const mapping = CATEGORY_BOOST_MAP[category];
  return {
    axis: mapping.axis,
    axisLabel: AXIS_LABELS[mapping.axis],
    boost: mapping.boost,
  };
}
