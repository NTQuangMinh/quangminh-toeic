"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Flame,
  ArrowRight,
  Sparkles,
  Target,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { Confetti } from "@/components/Confetti";

interface ProgressData {
  user: {
    id: string;
    name: string;
    dailyGoalTarget: number;
  };
  streak: number;
  todayGoal: {
    targetWords: number;
    learnedWords: number;
    remainingWords: number;
    percentage: number;
    completed: boolean;
  };
  counts: {
    dueForReview: number;
    practiceQuestions: number;
    totalLearned: number;
    mastered: number;
    learning: number;
    newWords: number;
    difficultWordsCount: number;
  };
  stats: {
    quizAccuracy: number;
    totalReviewSessions: number;
    wordsLearnedThisWeek: number;
  };
}

export default function DailyPlanPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingTarget, setIsUpdatingTarget] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/user/progress");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch daily plan progress:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const updateTarget = async (newTarget: number) => {
    setIsUpdatingTarget(true);
    try {
      const res = await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoalTarget: newTarget }),
      });
      if (res.ok) {
        fetchProgress();
      }
    } catch (err) {
      console.error("Failed to update target:", err);
    } finally {
      setIsUpdatingTarget(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { todayGoal, counts, streak, user, stats } = data || {
    todayGoal: { targetWords: 20, learnedWords: 0, remainingWords: 20, percentage: 0, completed: false },
    counts: { dueForReview: 0, practiceQuestions: 10, totalLearned: 0, mastered: 0, learning: 0, newWords: 100, difficultWordsCount: 0 },
    streak: 0,
    user: { id: "", name: "Học viên", dailyGoalTarget: 20 },
    stats: { quizAccuracy: 85, totalReviewSessions: 0, wordsLearnedThisWeek: 0 },
  };

  // Determine top priority next action
  let nextAction = {
    title: "Ôn tập các từ đến hạn (Due Reviews)",
    description: `Bạn có ${counts.dueForReview} từ cần ôn tập ngay theo đường cong quên lãng SM-2.`,
    href: "/review",
    buttonText: "Bắt đầu ôn tập ngay",
    badge: "Ưu tiên số 1",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  };

  if (counts.dueForReview === 0 && !todayGoal.completed) {
    nextAction = {
      title: "Học từ vựng mới (Learn New Words)",
      description: `Còn ${todayGoal.remainingWords} từ nữa để hoàn thành chỉ tiêu ${todayGoal.targetWords} từ hôm nay!`,
      href: "/learn",
      buttonText: "Học từ mới ngay",
      badge: "Ưu tiên hôm nay",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    };
  } else if (counts.dueForReview === 0 && todayGoal.completed) {
    nextAction = {
      title: "Luyện bài tập củng cố 10 câu (Practice Quiz)",
      description: "Đã hoàn thành chỉ tiêu ngày! Làm thêm bài trắc nghiệm nhanh để ghi nhớ sâu.",
      href: "/practice",
      buttonText: "Làm bài kiểm tra",
      badge: "Củng cố kiến thức",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }

  const todayDateFormatted = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-12">
      {todayGoal.completed && <Confetti />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{todayDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <span>Hôm nay học gì?</span>
            <span className="text-base sm:text-lg font-bold px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
              Daily Study Plan
            </span>
          </h1>
        </div>

        {/* Streak indicator */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 px-4 py-2 rounded-2xl shadow-xs self-start sm:self-center">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <div>
            <div className="text-[10px] font-bold uppercase text-orange-700">Chuỗi học liên tục</div>
            <div className="text-base font-black text-orange-950">
              {streak} ngày {streak >= 3 ? "🔥" : "🌱"}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Recommended Action Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${nextAction.badgeColor}`}>
              <Sparkles className="w-3 h-3" />
              {nextAction.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {nextAction.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {nextAction.description}
            </p>
          </div>

          <a
            href={nextAction.href}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all shrink-0 active:scale-95 text-center"
          >
            <span>{nextAction.buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3-Step Guided Learning Workflow */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Lộ trình hoàn thành trong ngày (3 bước chuẩn khoa học)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* STEP 1: Spaced Repetition Due Reviews */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                counts.dueForReview > 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {counts.dueForReview > 0 ? <RotateCcw className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Bước 1
                  </span>
                  <h4 className="text-base font-black text-slate-900">
                    Ôn tập từ đến hạn (Spaced Repetition SM-2)
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  {counts.dueForReview > 0
                    ? `Hiện có ${counts.dueForReview} từ cần ôn tập để chuyển vào bộ nhớ dài hạn.`
                    : "Tuyệt vời! Không có từ vựng nào bị quá hạn hôm nay."}
                </p>
              </div>
            </div>

            <a
              href="/review"
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all text-center shrink-0 ${
                counts.dueForReview > 0
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {counts.dueForReview > 0 ? `Ôn tập ${counts.dueForReview} từ →` : "Ôn tập tự do"}
            </a>
          </div>

          {/* STEP 2: Learn Daily New Words */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  todayGoal.completed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {todayGoal.completed ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Bước 2
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      Học từ vựng mới theo mục tiêu ngày
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Đã học <strong>{todayGoal.learnedWords}</strong> / <strong>{todayGoal.targetWords}</strong> từ mục tiêu ({todayGoal.percentage}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* Target word switcher */}
                <span className="text-xs text-slate-400 font-medium">Chỉ tiêu:</span>
                {[10, 20, 30].map((t) => (
                  <button
                    key={t}
                    disabled={isUpdatingTarget}
                    onClick={() => updateTarget(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      todayGoal.targetWords === t
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t} từ
                  </button>
                ))}

                <a
                  href="/learn"
                  className="ml-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
                >
                  {todayGoal.completed ? "Học thêm từ →" : "Học ngay →"}
                </a>
              </div>
            </div>

            <ProgressBar current={todayGoal.learnedWords} total={todayGoal.targetWords} color="blue" />
          </div>

          {/* STEP 3: Quick Reinforcement Practice Quiz */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Bước 3
                  </span>
                  <h4 className="text-base font-black text-slate-900">
                    Làm bài kiểm tra trắc nghiệm 10 câu (5 phút)
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Kiểm tra phản xạ nghe và đọc hiểu với đề thi thực tế bám sát chuẩn ETS.
                </p>
              </div>
            </div>

            <a
              href="/practice"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs text-center shrink-0"
            >
              Làm bài thi thử 10 câu →
            </a>
          </div>
        </div>
      </div>

      {/* Summary of Actual Learning Activity */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/60 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Tổng kết hoạt động học tập thực tế
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium">Tổng từ đã nạp</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{counts.totalLearned}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium">Từ thuộc nhuần nhuyễn</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{counts.mastered}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium">Từ hay làm sai</div>
            <div className="text-2xl font-black text-red-500 mt-1">
              <a href="/difficult-words" className="hover:underline">
                {counts.difficultWordsCount} từ
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/60">
            <div className="text-xs text-slate-500 font-medium">Độ chính xác Quiz</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{stats.quizAccuracy}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
