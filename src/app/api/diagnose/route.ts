import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calculateScores } from "@/lib/scoring";
import { buildDiagnosisPrompt } from "@/lib/prompts";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const FALLBACK_DIAGNOSIS = {
  headline: "あなたのデスク環境には改善の余地があります",
  strengths: "いくつかの項目では良い環境が整っています。現在の強みを活かしながら、弱点を補強していきましょう。",
  weaknesses: "スコアの低い軸を中心に、アイテムの見直しを検討してみてください。特に毎日使うチェアやモニター環境の改善は、即効性の高い投資です。",
  overall: "デスク環境は一朝一夕には完成しません。まずは最もスコアの低い分野から、一つずつ改善していきましょう。小さな変化が大きな成果を生みます。",
};

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Invalid answers" },
        { status: 400 }
      );
    }

    const { totalScore, axisScores } = calculateScores(answers);

    let diagnosis = FALLBACK_DIAGNOSIS;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const prompt = buildDiagnosisPrompt(answers, totalScore, axisScores);
        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        });

        const text =
          response.content[0].type === "text"
            ? response.content[0].text
            : "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          diagnosis = JSON.parse(jsonMatch[0]);
        }
      } catch (apiError) {
        console.error("Claude API error:", apiError);
      }
    }

    const result = {
      totalScore,
      axisScores,
      diagnosis,
      answers,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Diagnosis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
