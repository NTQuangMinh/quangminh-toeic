"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Flashcard, FlashcardWord } from "@/components/Flashcard";
import { ProgressBar } from "@/components/ProgressBar";
import { AudioButton } from "@/components/AudioButton";
import { Confetti } from "@/components/Confetti";
import { SM2Rating } from "@/lib/sm2";
import {
  ReviewQuizItem,
  MinimalVocab,
  generateReviewQuizList,
  createQuizQuestionForWord,
} from "@/lib/review-quiz";
import {
  RotateCcw,
  CheckCircle2,
  Award,
  BookOpen,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Volume2,
  ArrowRight,
  AlertTriangle,
  Check,
  X,
  Repeat,
  Layers,
  Flame,
  LayoutDashboard,
} from "lucide-react";

interface ReviewWord extends FlashcardWord {
  interval: number;
  repetitions: number;
  easeFactor: number;
  correctCount: number;
  wrongCount: number;
}

export default function ReviewPage() {
  // Mode: "quiz" (interactive quiz with re-queue) or "flashcard" (traditional SM-2 rating)
  const [reviewMode, setReviewMode] = useState<"quiz" | "flashcard">("quiz");

  const [words, setWords] = useState<ReviewWord[]>([]);
  const [pool, setPool] = useState<MinimalVocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // ================= QUIZ MODE STATE =================
  const [quizQueue, setQuizQueue] = useState<ReviewQuizItem[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [firstTryCorrectIds, setFirstTryCorrectIds] = useState<Set<string>>(new Set());
  const [requeuedWordIds, setRequeuedWordIds] = useState<Set<string>>(new Set());

  // ================= FLASHCARD MODE STATE =================
  const [cardIndex, setCardIndex] = useState(0);
  const [ratingsCount, setRatingsCount] = useState<Record<SM2Rating, number>>({
    AGAIN: 0,
    HARD: 0,
    GOOD: 0,
    EASY: 0,
  });

  const fetchDueWords = async () => {
    setLoading(true);
    setIsCompleted(false);
    setCardIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setFirstTryCorrectIds(new Set());
    setRequeuedWordIds(new Set());
    setRatingsCount({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 });

    try {
      const res = await fetch(`/api/review?_t=${Date.now()}`);
      const data = await res.json();
      const fetchedItems: ReviewWord[] = data.items || [];
      const fetchedPool: MinimalVocab[] = data.pool || [];

      setWords(fetchedItems);
      setPool(fetchedPool);
      setInitialCount(fetchedItems.length);

      if (fetchedItems.length > 0) {
        const questions = generateReviewQuizList(fetchedItems, fetchedPool);
        setQuizQueue(questions);
      } else {
        setQuizQueue([]);
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
    setCardIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setFirstTryCorrectIds(new Set());
    setRequeuedWordIds(new Set());
    setRatingsCount({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 });

    try {
      const res = await fetch(`/api/review?mode=all&_t=${Date.now()}`);
      const data = await res.json();
      const fetchedItems: ReviewWord[] = data.items || [];
      const fetchedPool: MinimalVocab[] = data.pool || [];

      setWords(fetchedItems);
      setPool(fetchedPool);
      setInitialCount(fetchedItems.length);

      if (fetchedItems.length > 0) {
        const questions = generateReviewQuizList(fetchedItems, fetchedPool);
        setQuizQueue(questions);
      } else {
        setQuizQueue([]);
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

  // Current active quiz question in queue
  const currentQ = quizQueue.length > 0 ? quizQueue[0] : null;

  // Handle option select in Quiz mode
  const handleSelectOption = async (idx: number) => {
    if (hasAnswered || !currentQ) return;

    setSelectedOption(idx);
    setHasAnswered(true);

    const correct = idx === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      // First try correct: mark as GOOD in SM-2
      if (!currentQ.hasFailedOnce) {
        setFirstTryCorrectIds((prev) => new Set(prev).add(currentQ.wordId));
        try {
          await fetch("/api/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wordId: currentQ.wordId,
              rating: "GOOD",
            }),
          });
        } catch (e) {
          console.error("Failed to update SM-2 for correct answer:", e);
        }
      }
    } else {
      // Failed: mark as AGAIN in SM-2 (adds to difficult words, resets repetition)
      setRequeuedWordIds((prev) => new Set(prev).add(currentQ.wordId));
      try {
        await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wordId: currentQ.wordId,
            rating: "AGAIN",
          }),
        });
      } catch (e) {
        console.error("Failed to update SM-2 for wrong answer:", e);
      }
    }
  };

  // Continue to next question or re-queue missed word
  const handleNextQuestion = () => {
    if (!currentQ) return;

    if (isCorrect) {
      // Mastered this word! Remove from queue
      const nextQueue = quizQueue.slice(1);
      setQuizQueue(nextQueue);

      if (nextQueue.length === 0) {
        setIsCompleted(true);
      }
    } else {
      // Answered wrong: RE-QUEUE to the END of queue with newly randomized options!
      const regeneratedVariant = createQuizQuestionForWord(
        currentQ,
        pool.length >= 4 ? pool : words,
        undefined,
        true
      );
      regeneratedVariant.hasFailedOnce = true;
      regeneratedVariant.isRetrying = true;

      const nextQueue = [...quizQueue.slice(1), regeneratedVariant];
      setQuizQueue(nextQueue);
    }

    // Reset answering state
    setSelectedOption(null);
    setHasAnswered(false);
  };

  // Handle flashcard rating in Flashcard mode
  const handleRateFlashcard = async (rating: SM2Rating) => {
    const currentWord = words[cardIndex];
    if (!currentWord) return;

    setRatingsCount((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

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

    if (cardIndex < words.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Option prefixes (A, B, C, D)
  const optionPrefixes = ["A", "B", "C", "D"];

  // Unique words mastered in this session
  const masteredUniqueCount = Math.min(
    initialCount,
    initialCount - quizQueue.filter((q) => !q.hasFailedOnce).length +
      (hasAnswered && isCorrect ? 1 : 0)
  );

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-2 sm:py-6 space-y-3 sm:space-y-5 pb-6 sm:pb-10">
      {/* ================= HEADER & MODE SWITCHER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 pb-2.5 sm:pb-4">
        <div>
          <h1 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <span>Ôn tập thông minh (Smart Review)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
            {reviewMode === "quiz"
              ? "Làm bài trắc nghiệm thực chiến, từ nào trả lời sai sẽ tự động xếp vào cuối lượt để hỏi lại!"
              : "Lặp lại ngắt quãng SM-2 để kích hoạt trí nhớ dài hạn trước khi bạn kịp quên từ"}
          </p>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setReviewMode("quiz")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              reviewMode === "quiz"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Quiz Trắc Nghiệm</span>
          </button>

          <button
            type="button"
            onClick={() => setReviewMode("flashcard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              reviewMode === "flashcard"
                ? "bg-white text-amber-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thẻ Flashcard</span>
          </button>
        </div>
      </div>

      {/* ================= BODY CONTENT ================= */}
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang chuẩn bị phiên ôn tập của bạn...</p>
        </div>
      ) : isCompleted ? (
        /* ================= REVIEW COMPLETE SUMMARY SCREEN ================= */
        <div className="p-6 sm:p-10 text-center bg-white rounded-3xl border border-slate-100 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <Confetti />

          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Hoàn thành phiên ôn tập! 🎉
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Bạn đã ôn luyện và chinh phục thành công toàn bộ{" "}
              <span className="font-bold text-slate-900">{initialCount || words.length}</span> từ
              vựng hôm nay. Thuật toán SM-2 đã cập nhật chu kỳ ghi nhớ mới.
            </p>
          </div>

          {/* Detailed Accuracy & Progress Stats */}
          {reviewMode === "quiz" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-center">
                <span className="text-2xl font-black text-blue-700 block">
                  {initialCount > 0
                    ? `${Math.round((firstTryCorrectIds.size / initialCount) * 100)}%`
                    : "100%"}
                </span>
                <span className="text-xs text-blue-900/80 font-bold mt-0.5 block">
                  Nhớ ngay lần đầu
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-center">
                <span className="text-2xl font-black text-emerald-700 block">
                  {firstTryCorrectIds.size} / {initialCount}
                </span>
                <span className="text-xs text-emerald-900/80 font-bold mt-0.5 block">
                  Từ nhớ chính xác
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-100 text-center">
                <span className="text-2xl font-black text-amber-700 block">
                  {requeuedWordIds.size}
                </span>
                <span className="text-xs text-amber-900/80 font-bold mt-0.5 block">
                  Từ đã khắc phục xong
                </span>
              </div>
            </div>
          ) : (
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
          )}

          {/* List of Re-queued words that were mastered */}
          {requeuedWordIds.size > 0 && reviewMode === "quiz" && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <Repeat className="w-4 h-4 text-amber-600" />
                <span>Các từ bạn từng chọn sai và đã vượt qua thành công:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from(requeuedWordIds).map((wId) => {
                  const targetWord = words.find((w) => w.id === wId);
                  return (
                    <span
                      key={wId}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{targetWord ? targetWord.word : wId}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={fetchCramWords}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ôn tập củng cố thêm</span>
            </button>

            <a
              href="/practice"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Làm bài trắc nghiệm TOEIC</span>
            </a>

            <a
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors text-center"
            >
              Về Trang chủ
            </a>
          </div>
        </div>
      ) : words.length === 0 ? (
        /* ================= EMPTY STATE (ALL CAUGHT UP) ================= */
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Không có từ nào đến hạn ôn!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn đã hoàn thành toàn bộ các từ cần ôn tập theo thuật toán SM-2. Hãy ôn củng cố tất cả
              các từ hoặc học thêm từ mới để nâng cao vốn từ vựng!
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={fetchCramWords}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ôn tập củng cố (Tất cả từ đã học)</span>
            </button>

            <a
              href="/learn"
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Học thêm từ mới</span>
            </a>

            <a
              href="/practice"
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors text-center"
            >
              Làm bài luyện thi TOEIC ETS
            </a>
          </div>
        </div>
      ) : reviewMode === "quiz" && currentQ ? (
        /* ================= ACTIVE SMART QUIZ REVIEW ================= */
        <div className="space-y-4 sm:space-y-5">
          {/* Progress Bar & Queue Indicator */}
          <div className="space-y-1.5 max-w-xl mx-auto">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-900">
                  Câu hỏi {masteredUniqueCount + 1} / {initialCount}
                </span>
                {currentQ.isRetrying && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    ⚠️ Hỏi lại từ sai
                  </span>
                )}
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                Còn {quizQueue.length} câu trong lượt
              </span>
            </div>

            <ProgressBar
              current={masteredUniqueCount}
              total={initialCount}
              color="amber"
              size="sm"
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-100 space-y-5">
            {/* Tag bar */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                  {currentQ.topic}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  {currentQ.toeicParts.split(",")[0]}
                </span>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {currentQ.partOfSpeech}
              </span>
            </div>

            {/* Question Title & Prompt */}
            <div className="text-center space-y-2 py-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {currentQ.questionTitle}
              </p>

              {currentQ.type === "listening" ? (
                /* Listening question type prompt */
                <div className="flex flex-col items-center justify-center gap-3 py-2">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center gap-3">
                    <AudioButton text={currentQ.word} size="lg" accent="US" showLabel />
                    <AudioButton text={currentQ.word} size="lg" accent="UK" showLabel />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Bấm loa để nghe phát âm và chọn nghĩa tiếng Việt
                  </span>
                </div>
              ) : currentQ.type === "fill_blank" ? (
                /* Fill in the blank sentence */
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <p className="text-base sm:text-lg font-bold text-slate-900 italic leading-relaxed">
                    "{currentQ.questionPrompt}"
                  </p>
                  <p className="text-xs text-slate-500">
                    ➜ Dịch: {currentQ.exampleTranslation}
                  </p>
                </div>
              ) : (
                /* English to Vietnamese meaning */
                <div className="space-y-1 py-1">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {currentQ.word}
                    </h2>
                    <AudioButton text={currentQ.word} size="sm" accent="US" />
                  </div>
                  <p className="text-sm font-mono text-slate-400 tracking-wide">
                    {currentQ.pronunciation}
                  </p>
                </div>
              )}
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentQ.correctIndex;

                let btnStyle =
                  "bg-white border-slate-200/80 text-slate-800 hover:border-blue-400 hover:bg-blue-50/30 active:scale-[0.98]";

                if (hasAnswered) {
                  if (isCorrectOption) {
                    btnStyle =
                      "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs";
                  } else {
                    btnStyle = "bg-slate-50/50 border-slate-100 text-slate-400 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasAnswered}
                    className={`min-h-[56px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${btnStyle}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        hasAnswered && isCorrectOption
                          ? "bg-emerald-600 text-white"
                          : hasAnswered && isSelected
                          ? "bg-rose-500 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {optionPrefixes[idx]}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm leading-snug break-words whitespace-normal flex-1">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Box after answering */}
            {hasAnswered && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
                  isCorrect
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs"
                    : "bg-amber-50/90 border-amber-200 text-amber-950 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCorrect ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}

                  <div className="space-y-1 flex-1">
                    <p className="font-black text-sm">
                      {isCorrect
                        ? "Chính xác! Xuất sắc 🎉"
                        : "Chưa chính xác! 💡 Từ này sẽ được hỏi lại ở cuối lượt."}
                    </p>
                    <p className="text-xs leading-relaxed opacity-90">{currentQ.explanation}</p>
                  </div>
                </div>

                {/* Continue / Next Button */}
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className={`w-full h-12 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                    isCorrect
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                      : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25"
                  }`}
                >
                  <span>
                    {isCorrect ? "Tiếp tục câu tiếp theo" : "Đã hiểu, đưa vào cuối lượt để hỏi lại"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= ACTIVE TRADITIONAL FLASHCARD MODE ================= */
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 max-w-xl mx-auto">
            <ProgressBar
              current={cardIndex + 1}
              total={words.length}
              label={`Thẻ ôn tập: ${cardIndex + 1} / ${words.length}`}
              color="amber"
              size="sm"
            />
          </div>

          <Flashcard
            word={words[cardIndex]}
            mode="review"
            onRate={handleRateFlashcard}
          />
        </div>
      )}
    </div>
  );
}
