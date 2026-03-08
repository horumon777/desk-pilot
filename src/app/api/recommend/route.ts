import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildRecommendPrompt } from "@/lib/prompts";
import { buildAmazonSearchUrl } from "@/lib/amazon";
import { CATEGORY_LABELS, RecommendCategory } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { answers, category, purchaseHistory, userStyle } =
      await request.json();

    if (!answers || !category) {
      return NextResponse.json(
        { error: "Missing answers or category" },
        { status: 400 }
      );
    }

    const categoryLabel =
      CATEGORY_LABELS[category as RecommendCategory] || category;

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback mock data
      const mockItems = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        productName: `${categoryLabel}おすすめ商品 ${i + 1}`,
        brand: "サンプルブランド",
        reason:
          "あなたの作業スタイルに最適な商品です。高品質でコストパフォーマンスに優れています。",
        searchQuery: `${categoryLabel} おすすめ ${i + 1}位`,
        priceRange: `¥${(i + 1) * 3000}〜¥${(i + 1) * 3000 + 5000}`,
        amazonUrl: buildAmazonSearchUrl(`${categoryLabel} おすすめ`),
        isPurchased: false,
      }));

      return NextResponse.json({ category, items: mockItems });
    }

    try {
      const prompt = buildRecommendPrompt(
        answers,
        category,
        categoryLabel,
        purchaseHistory,
        userStyle
      );

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const items = parsed.items.map(
        (item: {
          rank: number;
          productName: string;
          brand: string;
          reason: string;
          searchQuery: string;
          priceRange: string;
        }) => ({
          ...item,
          amazonUrl: buildAmazonSearchUrl(item.searchQuery),
          isPurchased: false,
        })
      );

      return NextResponse.json({ category, items });
    } catch (apiError) {
      console.error("Claude API error:", apiError);
      return NextResponse.json(
        { error: "AI recommendation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Recommend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
