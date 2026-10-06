"use client";

import React, { useEffect, useState } from "react";
import { Flashcard, FlashcardWord } from "@/components/Flashcard";
import { ProgressBar } from "@/components/ProgressBar";
import { Confetti } from "@/components/Confetti";
import { TOEIC_TOPICS, TOEIC_PARTS } from "@/data/toeic-vocab-seed";
import {
  BookOpen,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Filter,
  CheckCircle2,
  RefreshCw,
  Shuffle,
} from "lucide-react";

export default function LearnPage() {
  const [words, setWords] = useState<FlashcardWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedPart, setSelectedPart] = useState("all");
  const [selectedBand, setSelectedBand] = useState("all");
  const [isCompleted, setIsCompleted] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);

  const fetchWords = async () => {
    setLoading(true);
    setIsCompleted(false);
    setCurrentIndex(0);

    try {
      const params = new URLSearchParams();
      if (selectedTopic !== "all") params.set("topic", selectedTopic);
      if (selectedPart !== "all") params.set("toeicPart", selectedPart);
      if (selectedBand !== "all") params.set("difficulty", selectedBand);
      params.set("limit", "20");
      params.set("_t", Date.now().toString());

      const res = await fetch(`/api/learn?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setWords(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch learn words:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [selectedTopic, selectedPart, selectedBand]);

  const handleNext = async () => {
    const currentWord = words[currentIndex];
    if (currentWord) {
      // Record word as learned in database
      try {
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId: currentWord.id }),
        });
        const result = await res.json();
        if (result.justCompletedGoal) {
          setShowGoalCelebration(true);
        }
      } catch (err) {
        console.error("Failed to mark word as learned:", err);
      }
      setLearnedCount((prev) => prev + 1);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-8 space-y-3 sm:space-y-6 pb-28 sm:pb-12">
      {showGoalCelebration && <Confetti />}

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 pb-2.5 sm:pb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span>Học từ mới (Learn Mode)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
            Lật thẻ flashcard, nghe phát âm và ghi nhớ ngữ cảnh đề thi
          </p>
        </div>

        {/* Filter dropdowns & Shuffle */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {/* Topic filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="shrink-0 max-w-[160px] sm:max-w-none px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả chủ đề (20 Topics)</option>
            {TOEIC_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameEn} ({t.name})
              </option>
            ))}
          </select>

          {/* Target Band filter */}
          <select
            value={selectedBand}
            onChange={(e) => setSelectedBand(e.target.value)}
            className="shrink-0 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">🎯 Tất cả Band</option>
            <option value="BEGINNER">🟢 Band 450 - 600</option>
            <option value="INTERMEDIATE">🔵 Band 650 - 800</option>
            <option value="ADVANCED">🟣 Band 850+</option>
          </select>

          {/* TOEIC Part filter */}
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="shrink-0 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả Part</option>
            {TOEIC_PARTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </select>

          {/* Shuffle / Đổi lượt từ */}
          <button
            type="button"
            onClick={fetchWords}
            title="Đổi lượt từ ngẫu nhiên khác"
            className="shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl border border-slate-200/90 text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Đổi từ</span>
          </button>

          {/* Hands-Free Audio Quick Access */}
          <a
            href="/listen"
            title="Chuyển sang Chế độ Nghe Rảnh Tay Tự Động"
            className="shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
          >
            <span>🎧 Nghe rảnh tay</span>
          </a>
        </div>
      </div>


      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang chuẩn bị thẻ học...</p>
        </div>
      ) : isCompleted ? (
        /* Completion Screen */
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Hoàn thành phiên học! 🎉
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Bạn vừa học xong <span className="font-bold text-slate-900">{words.length}</span> từ mới trong phiên này. Các từ đã được lên lịch ôn tập thông minh bằng thuật toán SM-2.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href="/review"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ôn tập các từ đến hạn</span>
            </a>

            <a
              href="/practice"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Làm bài trắc nghiệm ngay</span>
            </a>

            <button
              type="button"
              onClick={fetchWords}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Học thêm từ mới khác</span>
            </button>
          </div>
        </div>
      ) : words.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <p className="text-slate-600 text-sm">
            Hiện tại không có từ mới nào phù hợp với bộ lọc đã chọn.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedTopic("all");
              setSelectedPart("all");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        /* Active Flashcard Learning View */
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-1.5 max-w-xl mx-auto">
            <ProgressBar
              current={currentIndex + 1}
              total={words.length}
              label={`Thẻ ${currentIndex + 1} / ${words.length}`}
              color="blue"
              size="sm"
            />
          </div>

          {/* Flashcard Component */}
          <Flashcard
            word={words[currentIndex]}
            mode="learn"
            onNext={handleNext}
            onPrev={currentIndex > 0 ? handlePrev : undefined}
          />
        </div>
      )}
    </div>
  );
}
