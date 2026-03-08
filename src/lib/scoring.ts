import { ScoreAxis } from "@/types";
import { DIAGNOSIS_QUESTIONS } from "./constants";

export function calculateScores(answers: Record<string, string>): {
  totalScore: number;
  axisScores: Record<ScoreAxis, number>;
} {
  const rawScores: Record<ScoreAxis, number> = {
    focus: 0,
    ergonomics: 0,
    productivity: 0,
    aesthetics: 0,
    maintenance: 0,
  };
  const maxPossible: Record<ScoreAxis, number> = {
    focus: 0,
    ergonomics: 0,
    productivity: 0,
    aesthetics: 0,
    maintenance: 0,
  };

  for (const question of DIAGNOSIS_QUESTIONS) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const selectedOption = question.options.find(
      (o) => o.id === selectedOptionId
    );
    if (!selectedOption) continue;

    for (const [axis, score] of Object.entries(
      selectedOption.scoreContributions
    )) {
      rawScores[axis as ScoreAxis] += score;
    }

    for (const axis of question.targetAxes) {
      const maxScore = Math.max(
        ...question.options.map((o) => o.scoreContributions[axis] ?? 0)
      );
      maxPossible[axis] += maxScore;
    }
  }

  const axisScores = {} as Record<ScoreAxis, number>;
  for (const axis of Object.keys(rawScores) as ScoreAxis[]) {
    const max = maxPossible[axis] || 1;
    axisScores[axis] = Math.round((rawScores[axis] / max) * 20);
  }

  const totalScore = Object.values(axisScores).reduce(
    (sum, v) => sum + v,
    0
  );

  return { totalScore, axisScores };
}
