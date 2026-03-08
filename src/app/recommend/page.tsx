"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import {
  STORAGE_KEYS,
  RecommendCategory,
  RecommendItem,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  PurchaseRecord,
} from "@/types";
import { Header } from "@/components/header";
import { toast } from "sonner";
import { getCategoryBoostInfo } from "@/lib/purchase-boost";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as RecommendCategory[];

export default function RecommendPage() {
  return (
    <Suspense>
      <RecommendContent />
    </Suspense>
  );
}

function RecommendContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as RecommendCategory) || "chair";

  const [activeCategory, setActiveCategory] =
    useState<RecommendCategory>(initialCategory);
  const [cache, setCache] = useState<
    Partial<Record<RecommendCategory, RecommendItem[]>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const stored = getStorageItem<Record<string, string> | null>(
      STORAGE_KEYS.DIAGNOSIS_ANSWERS,
      null
    );
    if (!stored) {
      router.push("/diagnose");
      return;
    }
    setAnswers(stored);
  }, [router]);

  const fetchRecommendations = useCallback(
    async (category: RecommendCategory) => {
      if (cache[category] || !answers) return;

      setIsLoading(true);
      try {
        const purchaseHistory = getStorageItem<PurchaseRecord[]>(
          STORAGE_KEYS.PURCHASE_HISTORY,
          []
        );
        const userStyle = getStorageItem<string | null>(
          STORAGE_KEYS.USER_STYLE,
          null
        );

        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            category,
            purchaseHistory: purchaseHistory.map((p) => p.productName),
            userStyle,
          }),
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setCache((prev) => ({ ...prev, [category]: data.items }));
      } catch {
        toast.error("レコメンドの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [answers, cache]
  );

  const handleFetch = useCallback(() => {
    if (answers) {
      fetchRecommendations(activeCategory);
    }
  }, [answers, activeCategory, fetchRecommendations]);

  const handlePurchase = (item: RecommendItem) => {
    const history = getStorageItem<PurchaseRecord[]>(
      STORAGE_KEYS.PURCHASE_HISTORY,
      []
    );
    const alreadyPurchased = history.some(
      (p) => p.productName === item.productName
    );

    if (alreadyPurchased) {
      const updated = history.filter(
        (p) => p.productName !== item.productName
      );
      setStorageItem(STORAGE_KEYS.PURCHASE_HISTORY, updated);
      toast("購入記録を削除しました");
    } else {
      const record: PurchaseRecord = {
        productName: item.productName,
        brand: item.brand,
        category: activeCategory,
        purchasedAt: new Date().toISOString(),
      };
      setStorageItem(STORAGE_KEYS.PURCHASE_HISTORY, [...history, record]);
      const boostInfo = getCategoryBoostInfo(activeCategory);
      toast.success(
        `購入記録を追加しました — ${boostInfo.axisLabel}スコア +${boostInfo.boost}点`
      );
    }

    setCache((prev) => {
      const items = prev[activeCategory];
      if (!items) return prev;
      return {
        ...prev,
        [activeCategory]: items.map((i) =>
          i.productName === item.productName
            ? { ...i, isPurchased: !i.isPurchased }
            : i
        ),
      };
    });
  };

  const items = cache[activeCategory];

  if (!answers) return null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-400 mb-2">
            Personalized Ranking
          </p>
          <h1 className="text-3xl font-bold text-neutral-900">
            おすすめTOP10
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            あなたの診断結果に基づいたアイテムランキング
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 -mx-5 px-5 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  activeCategory === cat
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-neutral-50 rounded-2xl border border-neutral-100 p-5"
              >
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                    <div className="h-3 w-full bg-neutral-100 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-100 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : !items ? (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-sm mb-6">
                「{CATEGORY_LABELS[activeCategory]}」のおすすめランキングを<br />AIが生成します
              </p>
              <button
                onClick={handleFetch}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ランキングを取得する
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.rank}
                className={`bg-white rounded-2xl border transition-colors p-5 ${
                  item.rank <= 3
                    ? "border-neutral-300 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 border border-neutral-200">
                    <span
                      className={`text-sm font-bold ${
                        item.rank <= 3 ? "text-neutral-900" : "text-neutral-400"
                      }`}
                    >
                      {item.rank}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                          {item.brand}
                        </span>
                        <span className="text-[10px] text-neutral-900 font-medium">
                          {item.priceRange}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {item.reason}
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                      <a
                        href={item.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-900 font-medium hover:underline"
                      >
                        Amazon で見る ↗
                      </a>
                      <button
                        className={`text-xs font-medium transition-colors ${
                          item.isPurchased
                            ? "text-emerald-600"
                            : "text-neutral-400 hover:text-neutral-900"
                        }`}
                        onClick={() => handlePurchase(item)}
                      >
                        {item.isPurchased ? "✓ 購入済み" : "＋ 購入記録"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
          <Link
            href="/history"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 transition-colors"
          >
            購入履歴を見る
          </Link>
          <Link
            href="/result"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            ← 診断結果に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
