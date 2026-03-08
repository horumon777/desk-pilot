"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useCallback } from "react";
import { getRank, getRankByLetter } from "@/lib/desk-rank";

const AXIS_LABELS: Record<string, string> = {
  f: "集中力環境",
  e: "人体工学",
  p: "生産性機器",
  a: "審美・ブランド",
  m: "習慣・メンテナンス",
};

function ShareCard() {
  const searchParams = useSearchParams();

  const score = parseInt(searchParams.get("s") || "0", 10);
  const rankParam = searchParams.get("r") || "";

  const handleShareX = useCallback(() => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const text = `デスク診断やってみた結果…\n\nスコア ${score}/100点 · ${rankParam}ランク\n「${rankParam ? getRankByLetter(rankParam).tagline : ""}」\n\nあなたのデスク環境は何点？👇\n#DESKAI #デスク診断`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [score, rankParam]);

  // Rank: use `r` param if provided, otherwise compute from score
  const rankInfo = rankParam ? getRankByLetter(rankParam) : getRank(score);

  const axes = {
    f: parseInt(searchParams.get("f") || "0", 10),
    e: parseInt(searchParams.get("e") || "0", 10),
    p: parseInt(searchParams.get("p") || "0", 10),
    a: parseInt(searchParams.get("a") || "0", 10),
    m: parseInt(searchParams.get("m") || "0", 10),
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-100 px-5 h-14 flex items-center justify-center">
        <Link href="/" className="text-lg font-bold tracking-tight">
          DESK AI
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Rank Card */}
          <div
            className="relative rounded-3xl overflow-hidden p-8 mb-8"
            style={{
              background: `linear-gradient(135deg, ${rankInfo.gradient.from}, ${rankInfo.gradient.to})`,
            }}
          >
            {/* Background rank letter decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[200px] font-black text-white/10 leading-none">
                {rankInfo.rank}
              </span>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-4">
                Desk Environment Score
              </p>

              {/* Score */}
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-8xl font-black text-white leading-none tabular-nums">
                  {score}
                </span>
                <span className="text-2xl text-white/60 font-medium">
                  / 100
                </span>
              </div>

              {/* Rank Label */}
              <p className="text-lg font-bold text-white mb-1">
                {rankInfo.label}
              </p>
              <p className="text-sm text-white/70 italic">
                {rankInfo.tagline}
              </p>
            </div>
          </div>

          {/* Axis Bars */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 mb-8">
            <div className="space-y-3">
              {Object.entries(axes).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 w-24 text-right flex-shrink-0">
                    {AXIS_LABELS[key]}
                  </span>
                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(value / 20) * 100}%`,
                        background: `linear-gradient(90deg, ${rankInfo.gradient.from}, ${rankInfo.gradient.to})`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-neutral-900 w-8 text-right tabular-nums">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-neutral-500 text-sm font-medium">
              あなたのデスクは何ランク？
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={handleShareX}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-700 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Xでシェアする
              </button>
              <Link
                href="/diagnose"
                className="group inline-flex items-center gap-2 border border-neutral-200 text-neutral-700 px-6 py-3 rounded-full text-sm font-semibold hover:bg-neutral-50 transition-all active:scale-[0.98]"
              >
                自分も診断する
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <p className="text-xs text-neutral-400">
              15の質問 · 約2分 · 完全無料
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-4 px-5 text-center">
        <p className="text-neutral-300 text-xs">
          &copy; 2026 DESK AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function ShareContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      }
    >
      <ShareCard />
    </Suspense>
  );
}
