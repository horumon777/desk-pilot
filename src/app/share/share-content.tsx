"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const AXIS_LABELS: Record<string, string> = {
  f: "集中力環境",
  e: "人体工学",
  p: "生産性機器",
  a: "審美・ブランド",
  m: "習慣・メンテナンス",
};

const DESK_TYPE_NAMES: Record<string, string> = {
  pragmatic: "質実剛健型",
  luxury: "ラグジュアリー型",
  minimalist: "ミニマリスト型",
  gadgetOtaku: "ガジェットオタク型",
  aspiring: "上昇志向型",
};

function ShareCard() {
  const searchParams = useSearchParams();

  const score = parseInt(searchParams.get("s") || "0", 10);
  const type = searchParams.get("t") || "aspiring";
  const typeName = DESK_TYPE_NAMES[type] || "上昇志向型";

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
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
              Desk Environment Score
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-8xl font-black text-neutral-900 leading-none tabular-nums">
                {score}
              </span>
              <span className="text-2xl text-neutral-400 font-medium">
                / 100
              </span>
            </div>
          </div>

          {/* Desk Type */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  score >= 80
                    ? "bg-green-500"
                    : score >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              />
              <span className="text-sm font-bold text-neutral-900">
                {typeName}
              </span>
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
                      className="h-full bg-neutral-900 rounded-full transition-all duration-1000"
                      style={{ width: `${(value / 20) * 100}%` }}
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
            <p className="text-neutral-500 text-sm">
              あなたのデスク環境は何点？
            </p>
            <Link
              href="/diagnose"
              className="group inline-flex items-center gap-2.5 bg-neutral-900 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              無料で診断する
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
            <p className="text-xs text-neutral-400">
              7つの質問 · 約60秒 · 完全無料
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
