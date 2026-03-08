import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { buildChatSystemPrompt } from "@/lib/prompts";
import { ScoreAxis, PurchaseRecord, UserProfile } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    // Rate limit: 20 messages per minute per IP
    const ip = getClientIp(request);
    const { success } = rateLimit(`chat:${ip}`, {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });
    if (!success) {
      return new Response(
        JSON.stringify({
          error:
            "リクエストが多すぎます。しばらくしてから再度お試しください。",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate message length to prevent abuse
    for (const msg of messages) {
      if (
        typeof msg.content !== "string" ||
        msg.content.length > 2000 ||
        !["user", "assistant"].includes(msg.role)
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const fallbackText =
        "現在AIアドバイザーは利用できません。環境変数 ANTHROPIC_API_KEY を設定してください。";
      return new Response(fallbackText, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Build system prompt server-side from raw context data
    let systemPrompt: string;
    if (context && context.axisScores) {
      systemPrompt = buildChatSystemPrompt(
        context.totalScore ?? 0,
        context.axisScores as Record<ScoreAxis, number>,
        context.boostedTotalScore ?? context.totalScore ?? 0,
        context.boostedAxisScores ?? context.axisScores,
        (context.purchases ?? []) as PurchaseRecord[],
        (context.weakestAxis ?? "focus") as ScoreAxis,
        (context.profile as UserProfile) ?? null
      );
    } else {
      // Fallback: minimal system prompt when no context
      systemPrompt =
        "あなたはデスク環境改善の専門アドバイザー「DeskPilot AI」です。20〜40代のビジネスパーソンに向けて、プロフェッショナルかつ心に刺さる言葉で回答してください。";
    }

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Convert Anthropic SDK stream to Web ReadableStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          stream.on("text", (text) => {
            controller.enqueue(encoder.encode(text));
          });

          stream.on("error", (error) => {
            console.error("Stream error:", error);
            controller.error(error);
          });

          // Wait for stream to complete
          await stream.finalMessage();
          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          try {
            controller.error(error);
          } catch {
            // controller may already be closed
          }
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
