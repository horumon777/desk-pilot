"use client";

import { useState, useEffect, useRef, useMemo, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/lib/storage";
import { calculatePurchaseBoosts } from "@/lib/purchase-boost";

import {
  STORAGE_KEYS,
  DiagnosisResult,
  PurchaseRecord,
  ChatMessage,
  ScoreAxis,
  AXIS_LABELS,
  UserProfile,
} from "@/types";
import { Header } from "@/components/header";
import { toast } from "sonner";

// --- Constants ---
const MAX_STORED_MESSAGES = 50;
const MAX_API_MESSAGES = 20;

// --- Markdown Rendering ---

function renderInline(text: string): React.ReactNode {
  // Handle **bold** → <strong>
  return text.split(/\*\*(.+?)\*\*/g).map((segment, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {segment}
      </strong>
    ) : (
      <Fragment key={i}>{segment}</Fragment>
    )
  );
}

function renderMessageContent(
  content: string,
  isUser: boolean
): React.ReactNode {
  if (isUser) {
    return <span>{content}</span>;
  }

  // Split into segments: plain text and markdown links
  const lines = content.split("\n");

  return lines.map((line, lineIdx) => {
    // Heading detection
    if (line.startsWith("### ")) {
      return (
        <p
          key={lineIdx}
          className="font-bold text-xs mt-3 mb-1 text-neutral-700"
        >
          {renderInline(line.slice(4))}
        </p>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <p
          key={lineIdx}
          className="font-bold text-sm mt-3 mb-1 text-neutral-800"
        >
          {renderInline(line.slice(3))}
        </p>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <p
          key={lineIdx}
          className="font-bold text-base mt-3 mb-1 text-neutral-900"
        >
          {renderInline(line.slice(2))}
        </p>
      );
    }

    // Bullet points
    if (line.startsWith("- ")) {
      return (
        <p key={lineIdx} className="pl-3 my-0.5">
          <span className="text-neutral-400 mr-1.5">-</span>
          {renderLineWithLinks(line.slice(2))}
        </p>
      );
    }

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s/);
    if (numberedMatch) {
      return (
        <p key={lineIdx} className="pl-3 my-0.5">
          <span className="text-neutral-400 mr-1.5 font-medium">
            {numberedMatch[1]}.
          </span>
          {renderLineWithLinks(line.slice(numberedMatch[0].length))}
        </p>
      );
    }

    // Empty line
    if (line.trim() === "") {
      return <br key={lineIdx} />;
    }

    // Regular line — handle links + inline formatting
    return (
      <p key={lineIdx} className="my-0.5">
        {renderLineWithLinks(line)}
      </p>
    );
  });
}

function renderLineWithLinks(line: string): React.ReactNode {
  // Find all markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(line)) !== null) {
    // Text before the link
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={`t-${match.index}`}>
          {renderInline(line.slice(lastIndex, match.index))}
        </Fragment>
      );
    }
    // The link
    const isAmazon = match[2].includes("amazon.co.jp");
    parts.push(
      <a
        key={`l-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-0.5 font-medium underline underline-offset-2 transition-colors ${
          isAmazon
            ? "text-neutral-900 hover:text-neutral-600"
            : "text-blue-600 hover:text-blue-500"
        }`}
      >
        {match[1]}
        <span className="text-[10px] no-underline">↗</span>
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < line.length) {
    parts.push(
      <Fragment key={`t-end`}>
        {renderInline(line.slice(lastIndex))}
      </Fragment>
    );
  }

  return parts.length > 0 ? parts : renderInline(line);
}

// --- Helpers ---

function getWeakestAxis(scores: Record<ScoreAxis, number>): ScoreAxis {
  let weakest: ScoreAxis = "focus";
  let minScore = Infinity;
  for (const [axis, score] of Object.entries(scores)) {
    if (score < minScore) {
      minScore = score;
      weakest = axis as ScoreAxis;
    }
  }
  return weakest;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Page ---

export default function ChatPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load data on mount
  useEffect(() => {
    const stored = getStorageItem<DiagnosisResult | null>(
      STORAGE_KEYS.DIAGNOSIS_RESULT,
      null
    );
    if (!stored) {
      router.push("/diagnose");
      return;
    }
    setResult(stored);

    const history = getStorageItem<PurchaseRecord[]>(
      STORAGE_KEYS.PURCHASE_HISTORY,
      []
    );
    setPurchases(history);

    const chatHistory = getStorageItem<ChatMessage[]>(
      STORAGE_KEYS.CHAT_HISTORY,
      []
    );
    setMessages(chatHistory);
  }, [router]);

  // Compute boosted scores
  const context = useMemo(() => {
    if (!result) return null;
    const boost = calculatePurchaseBoosts(result.axisScores, purchases);
    const weakestAxis = getWeakestAxis(boost.boostedAxisScores);
    return {
      boost,
      weakestAxis,
      currentTotal: boost.boostedTotalScore,
    };
  }, [result, purchases]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send handler
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || !result || !context) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Focus back on input
    inputRef.current?.focus();

    // Prepare API messages (limit to recent)
    const apiMessages = updatedMessages
      .slice(-MAX_API_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content }));

    // Send raw data to server — system prompt is built server-side
    const userProfile = getStorageItem<UserProfile | null>(
      STORAGE_KEYS.USER_PROFILE,
      null
    );
    const chatContext = {
      totalScore: result.totalScore,
      axisScores: result.axisScores,
      boostedTotalScore: context.boost.boostedTotalScore,
      boostedAxisScores: context.boost.boostedAxisScores,
      purchases: purchases.map((p) => ({
        productName: p.productName,
        brand: p.brand,
        category: p.category,
      })),
      weakestAxis: context.weakestAxis,
      profile: userProfile,
    };

    // Placeholder assistant message
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, context: chatContext }),
      });

      if (!res.ok) throw new Error("Failed to fetch");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        // Update assistant message progressively
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: accumulated } : m
          )
        );
      }

      // Save to localStorage
      const finalMessages = [
        ...updatedMessages,
        { ...assistantMessage, content: accumulated },
      ].slice(-MAX_STORED_MESSAGES);
      setStorageItem(STORAGE_KEYS.CHAT_HISTORY, finalMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("メッセージの送信に失敗しました");
      // Remove empty assistant message on error
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMessage.id)
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, result, context, purchases, messages]);

  // Key handler for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const handleClear = () => {
    setMessages([]);
    removeStorageItem(STORAGE_KEYS.CHAT_HISTORY);
    toast("チャット履歴をクリアしました");
  };

  if (!result || !context) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-5 py-6">
        {/* Page Header */}
        <div className="mb-4">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-400 mb-1">
            AI Desk Advisor
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">
            デスク改善チャット
          </h1>
        </div>

        {/* Context Summary Card */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
                Score
              </p>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">
                {context.currentTotal}
                <span className="text-sm text-neutral-400 font-normal">
                  /100
                </span>
              </p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center flex-1">
              <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
                Weakest
              </p>
              <p className="text-sm font-semibold text-red-500 mt-1">
                {AXIS_LABELS[context.weakestAxis]}
              </p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center flex-1">
              <p className="text-[10px] text-neutral-400 font-medium tracking-wider uppercase">
                Purchased
              </p>
              <p className="text-xl font-bold text-neutral-900 mt-0.5">
                {purchases.length}
                <span className="text-sm text-neutral-400 font-normal">
                  件
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px]">
          {/* Welcome message if no history */}
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <p className="text-neutral-900 font-semibold text-sm">
                  デスク環境について何でも相談してください
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  スコアと購入履歴を踏まえてアドバイスします
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {[
                  "集中力を上げるために何を買うべき？",
                  "予算3万円でデスクを改善したい",
                  "モニター環境を整えたい",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="text-xs bg-white border border-neutral-200 rounded-full px-3.5 py-2 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-colors"
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-50 border border-neutral-200 text-neutral-700"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {renderMessageContent(msg.content, msg.role === "user")}
                  {/* Streaming cursor */}
                  {msg.role === "assistant" &&
                    isStreaming &&
                    msg === messages[messages.length - 1] &&
                    msg.content.length > 0 && (
                      <span className="inline-block w-1.5 h-4 bg-neutral-400 animate-pulse ml-0.5 -mb-0.5 rounded-sm" />
                    )}
                </div>
                {/* Empty streaming state */}
                {msg.role === "assistant" &&
                  isStreaming &&
                  msg === messages[messages.length - 1] &&
                  msg.content.length === 0 && (
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Clear chat */}
        {messages.length > 0 && !isStreaming && (
          <div className="flex justify-center mb-3">
            <button
              onClick={handleClear}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              チャット履歴をクリア
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="デスク環境について質問する..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none min-h-[36px] max-h-[120px] py-1.5"
              style={{
                height: "auto",
                overflow: input.split("\n").length > 3 ? "auto" : "hidden",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
