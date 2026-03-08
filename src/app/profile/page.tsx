"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { getStorageItem, setStorageItem } from "@/lib/storage";
import {
  STORAGE_KEYS,
  UserProfile,
  PROFILE_FIELDS,
  DiagnosisResult,
} from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [saved, setSaved] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    const existing = getStorageItem<UserProfile | null>(
      STORAGE_KEYS.USER_PROFILE,
      null
    );
    if (existing) {
      setProfile(existing);
      setIsExisting(true);
    }
    const result = getStorageItem<DiagnosisResult | null>(
      STORAGE_KEYS.DIAGNOSIS_RESULT,
      null
    );
    if (result) {
      setHasResult(true);
    }
  }, []);

  const handleSelect = (fieldKey: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [fieldKey]: prev[fieldKey as keyof UserProfile] === value ? undefined : value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    const profileData: UserProfile = {
      ageRange: profile.ageRange || "",
      gender: profile.gender || "",
      occupation: profile.occupation || "",
      exerciseFrequency: profile.exerciseFrequency || "",
      deskHoursPerDay: profile.deskHoursPerDay || "",
      budgetRange: profile.budgetRange || "",
      updatedAt: new Date().toISOString(),
    };
    setStorageItem(STORAGE_KEYS.USER_PROFILE, profileData);
    setSaved(true);
    setIsExisting(true);

    // Auto-dismiss toast
    setTimeout(() => setSaved(false), 3000);
  };

  const filledCount = PROFILE_FIELDS.filter(
    (f) => profile[f.key as keyof UserProfile]
  ).length;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-2xl mx-auto px-5 pt-8 pb-20">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-medium text-neutral-600">
              Optional
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            プロフィール設定
          </h1>
          <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
            設定するとAIの診断・商品提案・チャットの精度が向上します。
            <br className="hidden md:block" />
            すべて任意項目です。いつでも変更できます。
          </p>

          {/* Completion indicator */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                style={{
                  width: `${(filledCount / PROFILE_FIELDS.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-400">
              {filledCount}/{PROFILE_FIELDS.length}
            </span>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="space-y-8">
          {PROFILE_FIELDS.map((field) => (
            <div key={field.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{field.icon}</span>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {field.label}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => {
                  const isSelected =
                    profile[field.key as keyof UserProfile] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(field.key, option.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-neutral-900 text-white border-2 border-neutral-900 shadow-sm"
                          : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98]"
          >
            {isExisting ? "更新する" : "保存する"}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>

          {!isExisting && !hasResult && (
            <button
              onClick={() => router.push("/diagnose")}
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              スキップして診断へ
            </button>
          )}

          {hasResult && (
            <button
              onClick={() => router.push("/result")}
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              結果ページに戻る
            </button>
          )}
        </div>
      </main>

      {/* Toast */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-neutral-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            プロフィールを保存しました
          </div>
        </div>
      )}
    </div>
  );
}
