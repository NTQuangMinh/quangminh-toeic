"use client";

import React, { useEffect, useState } from "react";
import { Flashcard, FlashcardWord } from "@/components/Flashcard";
import { ProgressBar } from "@/components/ProgressBar";
import { SM2Rating } from "@/lib/sm2";
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface ReviewWord extends FlashcardWord {
  interval: number;
  repetitions: number;
  easeFactor: number;
  correctCount: number;
  wrongCount: number;
}

export default function ReviewPage() {
  const [words, setWords] = useState<ReviewWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ratingsCount, setRatingsCount] = useState<Record<SM2Rating, number>>({
    AGAIN: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0,
  });

  const fetchDueWords = async () => {
    setLoading(true);
    setIsCompleted(false);
    setCurrentIndex(0);
    setRatingsCount({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 });

    try {
      const res = await fetch(`/api/review?_t=${Date.now()}`);
      const data = await res.json();
      if (data.items) {
        setWords(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch due review words:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCramWords = async () => {
    setLoading(true);
    setIsCompleted(false);
    setCurrentIndex(0);
    setRatingsCount({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 });

    try {
      const res = await fetch(`/api/review?mode=all&_t=${Date.now()}`);
      const data = await res.json();
      if (data.items) {
        setWords(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch cram review words:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueWords();
  }, []);


  const handleRate = async (rating: SM2Rating) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    // Track local rating breakdown
    setRatingsCount((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    // Post to API to calculate SM-2 and update DB
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordId: currentWord.id,
          rating,
        }),
      });
    } catch (err) {
      console.error("Failed to submit review rating:", err);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-8 space-y-3 sm:space-y-6 pb-28 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            <span>Ôn tập ngắt quãng (SM-2)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
            Lặp lại ngắt quãng để kích hoạt trí nhớ dài hạn trước khi bạn kịp quên từ
          </p>
        </div>

        {words.length > 0 && !isCompleted && (
          <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {words.length - currentIndex} từ còn lại
          </span>
        )}
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang kiểm tra lịch ôn tập của bạn...</p>
        </div>
      ) : isCompleted ? (
        /* Review Complete Summary Screen */
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Đã hoàn thành phiên ôn tập! 🎉
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Bạn đã ôn luyện lại <span className="font-bold text-slate-900">{words.length}</span> từ vựng hôm nay. Thuật toán SM-2 đã cập nhật chu kỳ ghi nhớ mới cho bạn.
            </p>
          </div>

          {/* Rating Breakdown Cards */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto pt-2">
            <div className="p-3 rounded-2xl bg-red-50 border border-red-100">
              <span className="text-xl font-black text-red-600 block">{ratingsCount.AGAIN}</span>
              <span className="text-[11px] text-red-700/80 font-medium">Again (Quên)</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-xl font-black text-amber-600 block">{ratingsCount.HARD}</span>
              <span className="text-[11px] text-amber-700/80 font-medium">Hard (Khó)</span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-xl font-black text-blue-600 block">{ratingsCount.GOOD}</span>
              <span className="text-[11px] text-blue-700/80 font-medium">Good (Tốt)</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-xl font-black text-emerald-600 block">{ratingsCount.EASY}</span>
              <span className="text-[11px] text-emerald-700/80 font-medium">Easy (Dễ)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href="/practice"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Kiểm tra bài test</span>
            </a>

            <a
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors text-center"
            >
              Về Dashboard
            </a>
          </div>
        </div>
      ) : words.length === 0 ? (
        /* All caught up */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Không có từ nào đến hạn ôn!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn đã hoàn thành toàn bộ các từ cần ôn tập theo thuật toán SM-2. Hãy học thêm từ mới hoặc làm bài kiểm tra để củng cố phản xạ!
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={fetchCramWords}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ôn tập củng cố (Tất cả từ đã học)</span>
            </button>
            <a
              href="/learn"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors"
            >
              Học thêm từ mới
            </a>
            <a
              href="/practice"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              Làm bài luyện thi TOEIC
            </a>
          </div>

        </div>
      ) : (
        /* Active Review Card */
        <div className="space-y-6">
          <div className="space-y-1.5 max-w-xl mx-auto">
            <ProgressBar
              current={currentIndex + 1}
              total={words.length}
              label={`Ôn tập: ${currentIndex + 1} / ${words.length}`}
              color="amber"
              size="sm"
            />
          </div>

          <Flashcard
            word={words[currentIndex]}
            mode="review"
            onRate={handleRate}
          />
        </div>
      )}
    </div>
  );
}
