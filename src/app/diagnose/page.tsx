"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSIS_QUESTIONS } from "@/lib/constants";
import { setStorageItem } from "@/lib/storage";
import { STORAGE_KEYS, DiagnosisResult } from "@/types";
import { Header } from "@/components/header";

export default function DiagnosePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  const totalQuestions = DIAGNOSIS_QUESTIONS.length;
  const question = DIAGNOSIS_QUESTIONS[currentStep];
  const progress = ((currentStep + (selectedOption ? 1 : 0)) / totalQuestions) * 100;
  const isLastQuestion = currentStep === totalQuestions - 1;

  // Reset fade-in when step changes
  useEffect(() => {
    const timer = setTimeout(() => setFadeState("in"), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleAnswer = useCallback(
    async (optionId: string) => {
      // Prevent double-clicks
      if (selectedOption) return;

      setSelectedOption(optionId);
      const newAnswers = { ...answers, [question.id]: optionId };
      setAnswers(newAnswers);

      if (isLastQuestion) {
        // Delay briefly to show selection, then submit
        setTimeout(async () => {
          setIsSubmitting(true);
          try {
            const res = await fetch("/api/diagnose", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ answers: newAnswers }),
            });
            if (!res.ok) throw new Error("Diagnosis failed");
            const result: DiagnosisResult = await res.json();
            setStorageItem(STORAGE_KEYS.DIAGNOSIS_RESULT, result);
            setStorageItem(STORAGE_KEYS.DIAGNOSIS_ANSWERS, newAnswers);
            router.push("/result");
          } catch {
            setIsSubmitting(false);
            setSelectedOption(null);
            alert("診断に失敗しました。もう一度お試しください。");
          }
        }, 500);
      } else {
        // Show selection feedback → fade out → advance → fade in
        setTimeout(() => {
          setFadeState("out");
          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
            setSelectedOption(null);
            setFadeState("out"); // Will be set to "in" by useEffect
          }, 300);
        }, 400);
      }
    },
    [answers, question, isLastQuestion, router, selectedOption]
  );

  const handleBack = useCallback(() => {
    if (currentStep === 0 || selectedOption) return;
    setFadeState("out");
    setTimeout(() => {
      setCurrentStep((prev) => prev - 1);
      setSelectedOption(null);
      setFadeState("out");
    }, 200);
  }, [currentStep, selectedOption]);

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-5">
          <div className="space-y-8 text-center">
            {/* Animated rings */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-2 border-neutral-200 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-neutral-900 rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-transparent border-t-neutral-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">
                AIが分析中...
              </h2>
              <p className="text-neutral-400 text-sm mt-2">
                あなたの回答から最適なデスク環境を算出しています
              </p>
            </div>
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-2xl mx-auto px-5 pt-8 pb-16">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="p-1 -ml-1 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-900"
                  aria-label="前の質問"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <span className="text-sm font-medium text-neutral-900">
                {currentStep + 1}
                <span className="text-neutral-300 mx-1">/</span>
                <span className="text-neutral-400">{totalQuestions}</span>
              </span>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Segmented progress */}
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full overflow-hidden bg-neutral-100"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i < currentStep
                      ? "bg-neutral-900 w-full"
                      : i === currentStep && selectedOption
                        ? "bg-neutral-900 w-full"
                        : i === currentStep
                          ? "bg-neutral-300 w-1/2"
                          : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Question */}
        <div
          className={`transition-all duration-300 ease-out ${
            fadeState === "in"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          {/* Question header */}
          <div className="mb-8">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
              Question {currentStep + 1}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-snug whitespace-pre-line">
              {question.questionText}
            </h2>
            {question.description && (
              <p className="text-neutral-400 text-sm mt-3">
                {question.description}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === option.id;
              const isOther = selectedOption !== null && !isSelected;

              return (
                <button
                  key={option.id}
                  disabled={selectedOption !== null}
                  className={`w-full text-left flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-neutral-900 bg-neutral-900 text-white scale-[1.02] shadow-lg shadow-neutral-900/10"
                      : isOther
                        ? "border-neutral-100 bg-neutral-50 text-neutral-300 scale-[0.98] opacity-50"
                        : "border-neutral-100 bg-white hover:border-neutral-300 hover:shadow-sm active:scale-[0.98]"
                  }`}
                  onClick={() => handleAnswer(option.id)}
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  <span
                    className={`text-2xl flex-shrink-0 transition-transform duration-300 ${
                      isSelected ? "scale-110" : ""
                    }`}
                  >
                    {option.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm md:text-base transition-colors ${
                        isSelected
                          ? "text-white"
                          : isOther
                            ? "text-neutral-300"
                            : "text-neutral-900"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p
                      className={`text-xs md:text-sm mt-0.5 leading-relaxed transition-colors ${
                        isSelected
                          ? "text-neutral-300"
                          : isOther
                            ? "text-neutral-300"
                            : "text-neutral-500"
                      }`}
                    >
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Keyboard hint (desktop only) */}
        <div className="hidden md:flex justify-center mt-8">
          <p className="text-xs text-neutral-300">
            選択肢をクリックすると自動的に次へ進みます
          </p>
        </div>
      </main>
    </div>
  );
}
