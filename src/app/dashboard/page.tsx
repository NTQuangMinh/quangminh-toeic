"use client";

import React, { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Confetti } from "@/components/Confetti";
import { TOEIC_TOPICS } from "@/data/toeic-vocab-seed";
import {
  Flame,
  BookOpen,
  RotateCcw,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Award,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

interface ProgressData {
  user: {
    id: string;
    name: string;
    email: string;
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
    newWordsToday: number;
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

export default function DashboardPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/progress")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning 👋";
    if (hour < 18) return "Good afternoon 👋";
    return "Good evening 👋";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-200 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const { user, streak, todayGoal, counts, stats } = data || {
    user: { name: "Bạn học TOEIC", dailyGoalTarget: 20 },
    streak: 1,
    todayGoal: { targetWords: 20, learnedWords: 0, remainingWords: 20, percentage: 0, completed: false },
    counts: { newWordsToday: 5, dueForReview: 0, practiceQuestions: 10, totalLearned: 0, mastered: 0, learning: 0, newWords: 100, difficultWordsCount: 0 },
    stats: { quizAccuracy: 85, totalReviewSessions: 0, wordsLearnedThisWeek: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Show Confetti if today's goal is completed */}
      {todayGoal.completed && <Confetti />}

      {/* ================= GREETING & STREAK BANNER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Chào mừng <span className="font-semibold text-slate-800">{user.name}</span>. Bạn đã sẵn sàng học hôm nay chưa?
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
          <div className="text-left">
            <span className="text-xs text-amber-700/80 font-medium block leading-none">Chuỗi học tập</span>
            <span className="text-base font-extrabold text-amber-900 leading-tight">
              🔥 {streak} ngày streak
            </span>
          </div>
        </div>
      </div>

      {/* ================= TODAY'S GOAL & LEARNING CARD ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Goal Progress */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-200">
                Today's Goal (Mục tiêu hôm nay)
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
                {todayGoal.completed ? "🎉 Hoàn thành xuất sắc!" : `${todayGoal.remainingWords} từ còn lại`}
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-blue-900/60 rounded-full h-4 p-0.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${todayGoal.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-blue-100 font-medium">
                <span>
                  {todayGoal.learnedWords} / {todayGoal.targetWords} words ({todayGoal.percentage}%)
                </span>
                <span>Mục tiêu: {todayGoal.targetWords} từ/ngày</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed pt-1">
              {todayGoal.completed
                ? "Tuyệt vời! Bạn đã hoàn thành chỉ tiêu ngày hôm nay. Hãy duy trì thói quen hoặc tiếp tục ôn tập từ khó!"
                : "Mỗi ngày tích lũy một ít là bí quyết đạt điểm cao trong TOEIC. Nhấn nút bên dưới để tiếp tục."}
            </p>

            <div className="pt-2">
              <a
                href={counts.dueForReview > 0 ? "/review" : "/learn"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <span>Continue Learning (Tiếp tục học)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Today's Learning Counts */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block border-b border-white/15 pb-2">
              Today's Learning (Nhiệm vụ hôm nay)
            </span>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Từ mới hôm nay</span>
                <span className="font-extrabold text-white text-base">{counts.newWordsToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Đến hạn ôn tập (SM-2)</span>
                <span className="font-extrabold text-amber-300 text-base">{counts.dueForReview}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Câu hỏi luyện tập</span>
                <span className="font-extrabold text-white text-base">{counts.practiceQuestions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3 CORE LEARNING MODES ================= */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
          Chế độ học tập chính
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Learn New Words */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  📚 Learn New Words
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Học từ mới qua Flashcard 3D thông minh, phát âm US/UK và ví dụ thực tế.
                </p>
              </div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50/70 p-2 rounded-lg">
                Hôm nay: {counts.newWordsToday} từ mới đang chờ bạn
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/learn"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Start (Bắt đầu học)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Review Due Words */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  🔄 Review Due
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lặp lại ngắt quãng SM-2: Again, Hard, Good, Easy để không bao giờ quên từ.
                </p>
              </div>
              <div className="text-xs font-semibold text-amber-700 bg-amber-50/70 p-2 rounded-lg">
                {counts.dueForReview > 0
                  ? `Có ${counts.dueForReview} từ đến hạn ôn tập ngay`
                  : "Đã hoàn thành ôn tập hôm nay!"}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/review"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Review (Ôn tập ngay)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 3: Practice Quiz */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-lg transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  📝 Practice Quiz
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Luyện đề trắc nghiệm chuẩn TOEIC: điền câu, nghĩa, nghe và dịch.
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50/70 p-2 rounded-lg">
                Độ chính xác hiện tại: {stats.quizAccuracy}%
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/practice"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Start Quiz (Luyện thi)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= REAL STATISTICS OVERVIEW ================= */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
          Thống kê học tập thực tế (Real Database Stats)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Tổng từ đã học</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{counts.totalLearned}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Đã thuần thục (Mastered)</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{counts.mastered}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Độ chính xác bài test</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{stats.quizAccuracy}%</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium">Số lượt ôn tập</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalReviewSessions}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 font-medium">Từ hay làm sai</span>
            <a
              href="/difficult-words"
              className="text-2xl font-black text-red-500 hover:text-red-700 mt-1 block"
            >
              {counts.difficultWordsCount}
            </a>
          </div>
        </div>
      </div>

      {/* ================= QUICK SHORTCUTS & DIFFICULT WORDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficult Words Teaser */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-red-700">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Từ vựng hay sai (My Difficult Words)</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {counts.difficultWordsCount} từ
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Các từ bạn đã chọn "Again" hoặc trả lời sai trong bài trắc nghiệm. Luyện riêng những từ này để nâng điểm nhanh nhất!
            </p>
          </div>

          <div className="pt-4">
            <a
              href="/difficult-words"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <span>Xem danh sách & Luyện ngay</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bookmarked Words Teaser */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-amber-800">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Từ vựng đã lưu (My Vocabulary)</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Đã đánh dấu
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tập hợp các từ vựng bạn đã nhấn biểu tượng ngôi sao để tiện xem lại hoặc học nhanh bất cứ lúc nào.
            </p>
          </div>

          <div className="pt-4">
            <a
              href="/bookmarks"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              <span>Xem các từ đã lưu</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
