"use client";

import Link from "next/link";
import { Header } from "@/components/header";
import { useEffect, useState } from "react";
import { getStorageItem } from "@/lib/storage";
import { STORAGE_KEYS, DiagnosisResult } from "@/types";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI診断",
    description: "7つの質問からデスク環境を5軸で数値化",
  },
  {
    icon: "🛒",
    title: "商品提案",
    description: "スコアに基づいたAmazon購入可能アイテムTOP10",
  },
  {
    icon: "📈",
    title: "成長トラッキング",
    description: "購入ごとにスコアが上がる。改善の軌跡を可視化",
  },
  {
    icon: "💬",
    title: "AIチャット",
    description: "あなた専用のデスク改善アドバイザーに相談",
  },
];

const STEPS = [
  { num: "01", label: "診断する", desc: "7つの質問に直感で回答" },
  { num: "02", label: "分析を見る", desc: "5軸レーダーチャートで弱点を把握" },
  { num: "03", label: "厳選アイテムを選ぶ", desc: "AIが選んだTOP10から購入" },
  { num: "04", label: "進化を実感", desc: "スコアが上がり、環境が変わる" },
];

export default function Home() {
  const [hasResult, setHasResult] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const result = getStorageItem<DiagnosisResult | null>(
      STORAGE_KEYS.DIAGNOSIS_RESULT,
      null
    );
    if (result) {
      setHasResult(true);
      setScore(result.totalScore);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-neutral-100/80 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-5 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-neutral-600">
                AI-Powered Desk Advisor
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
              デスクを変えれば、
              <br />
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900 bg-clip-text text-transparent">
                仕事が変わる。
              </span>
            </h1>

            <p className="mt-6 text-neutral-500 text-lg leading-relaxed max-w-lg">
              AIがあなたの仕事スタイルを診断し、最適なデスク環境を設計。
              <br className="hidden md:block" />
              7つの質問、約60秒で完了。
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link
                href="/diagnose"
                className="group inline-flex items-center gap-2.5 bg-neutral-900 text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98]"
              >
                {hasResult ? "もう一度診断する" : "無料で診断する"}
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

              {hasResult && (
                <Link
                  href="/result"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                >
                  スコアを見る
                  {score !== null && (
                    <span className="bg-neutral-100 text-neutral-900 px-2 py-0.5 rounded-full text-xs font-bold">
                      {score}点
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Score preview for returning users */}
          {hasResult && score !== null && (
            <div className="mt-12 inline-flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                />
                <span className="text-sm text-neutral-500">
                  現在のスコア:
                </span>
                <span className="text-lg font-bold text-neutral-900">
                  {score}/100
                </span>
              </div>
              <div className="w-px h-5 bg-neutral-200" />
              <Link
                href="/chat"
                className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                AIに相談 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
              How it works
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              4ステップで理想のデスクへ
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative group">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-neutral-200" />
                )}
                <div className="relative bg-white rounded-2xl border border-neutral-100 p-5 hover:border-neutral-200 hover:shadow-sm transition-all">
                  <span className="text-3xl font-bold text-neutral-100 group-hover:text-neutral-200 transition-colors">
                    {step.num}
                  </span>
                  <p className="text-sm font-semibold text-neutral-900 mt-2">
                    {step.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-100">
        <div className="max-w-5xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
              Features
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              DESK AIでできること
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex items-start gap-4 bg-white rounded-2xl border border-neutral-100 p-5 hover:border-neutral-200 hover:shadow-sm transition-all"
              >
                <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {f.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-900">
        <div className="max-w-5xl mx-auto px-5 py-16 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            あなたのデスク、何点ですか？
          </h2>
          <p className="text-neutral-400 text-sm mb-8 max-w-md mx-auto">
            7つの質問に答えるだけ。AIがあなたの仕事環境を5つの軸で分析し、
            具体的な改善プランを提案します。
          </p>
          <Link
            href="/diagnose"
            className="group inline-flex items-center gap-2.5 bg-white text-neutral-900 px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-100 transition-all active:scale-[0.98]"
          >
            今すぐ診断する
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
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-6 px-5">
        <div className="max-w-5xl mx-auto text-center space-y-1">
          <p className="text-neutral-400 text-xs">
            本サービスはAmazonアソシエイト・プログラムの参加者です。
          </p>
          <p className="text-neutral-300 text-xs">
            &copy; 2026 DESK AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
