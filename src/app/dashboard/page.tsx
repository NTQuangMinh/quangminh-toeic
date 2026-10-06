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
  Sun,
  Moon,
  TrendingUp,
  Gamepad2,
  Headphones,
  Target,
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
    if (hour < 12) return { text: "Good morning", icon: Sun, color: "text-amber-500" };
    if (hour < 18) return { text: "Good afternoon", icon: Sun, color: "text-orange-500" };
    return { text: "Good evening", icon: Moon, color: "text-indigo-400" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded-2xl w-1/3" />
          <div className="h-56 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
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
          <div className="flex items-center gap-2">
            <GreetingIcon className={`w-5 h-5 ${greeting.color}`} />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {greeting.text}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user.name}</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Hôm nay bạn muốn học bao nhiêu từ vựng để bứt phá mục tiêu TOEIC?
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30">
            <Flame className="w-5 h-5 fill-white animate-bounce" />
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700/80 block leading-tight">Chuỗi học tập</span>
            <span className="text-sm sm:text-base font-black text-amber-900 leading-tight">
              {streak} ngày streak
            </span>
          </div>
        </div>
      </div>

      {/* ================= TODAY'S GOAL HERO CARD ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden border border-blue-500/20">
        {/* Ambient Decorative Blurs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Goal Progress */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-blue-100 backdrop-blur-md border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                Mục tiêu hôm nay (Today's Goal)
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                {todayGoal.completed ? "🎉 Hoàn thành xuất sắc!" : `${todayGoal.remainingWords} từ còn lại`}
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="w-full bg-slate-900/60 rounded-full h-4 p-0.5 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(0, todayGoal.percentage))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-blue-100/90 font-semibold">
                <span>
                  {todayGoal.learnedWords} / {todayGoal.targetWords} từ ({todayGoal.percentage}%)
                </span>
                <span className="text-blue-200/80">Chỉ tiêu: {todayGoal.targetWords} từ/ngày</span>
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Continue Learning (Tiếp tục học)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Today's Learning Counts */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block border-b border-white/15 pb-2.5">
              Nhiệm vụ trong ngày (Daily Tasks)
            </span>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-100 font-medium">Từ mới hôm nay</span>
                <span className="font-black text-white text-base px-2.5 py-0.5 rounded-lg bg-white/10">
                  {counts.newWordsToday}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100 font-medium">Đến hạn ôn tập (SM-2)</span>
                <span className="font-black text-amber-300 text-base px-2.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-300/30">
                  {counts.dueForReview}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100 font-medium">Câu hỏi luyện tập</span>
                <span className="font-black text-white text-base px-2.5 py-0.5 rounded-lg bg-white/10">
                  {counts.practiceQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3 CORE LEARNING MODES ================= */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Chế độ học tập chính</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Learn New Words */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  📚 Learn New Words
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Học từ mới qua Flashcard 3D thông minh, phát âm US/UK và ví dụ thực tế trong đề thi.
                </p>
              </div>
              <div className="text-xs font-semibold text-blue-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                Hôm nay: {counts.newWordsToday} từ mới đang chờ bạn
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/learn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <span>Start Learning (Bắt đầu học)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Review Due Words */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  🔄 Review Due
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Lặp lại ngắt quãng SM-2: Again, Hard, Good, Easy để không bao giờ quên từ vựng đã học.
                </p>
              </div>
              <div className="text-xs font-semibold text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                {counts.dueForReview > 0
                  ? `Có ${counts.dueForReview} từ đến hạn ôn tập ngay`
                  : "Đã hoàn thành ôn tập hôm nay!"}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/review"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <span>Review Due (Ôn tập ngay)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 3: Practice Quiz */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  📝 Practice Quiz
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Luyện đề trắc nghiệm chuẩn TOEIC: điền câu, nghĩa từ, nghe phát âm và dịch câu.
                </p>
              </div>
              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
                Độ chính xác hiện tại: {stats.quizAccuracy}%
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/practice"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                <span>Start Quiz (Luyện thi)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NEW INTERACTIVE MODES & MINI-GAMES ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Tiện ích & Game luyện phản xạ mới</span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200">
              New
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Word Match Game */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/25">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Word Match Game
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/50">
                    Quizlet Style
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Trò chơi nối từ tiếng Anh & nghĩa tiếng Việt tốc độ cao. Đo phản xạ mili-giây, combo thưởng và phá kỷ lục cá nhân!
                </p>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/match"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                <span>Chơi Game Nối Từ Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Hands-Free Audio Player */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/25">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Hands-Free Audio Player
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300/50">
                    Migii Style
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Nghe từ vựng tự động rảnh tay: Phát âm US/UK, đọc nghĩa và câu ví dụ, hỗ trợ hẹn giờ tắt khi ngủ hoặc đi lại.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/listen"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <span>Bật Nghe Rảnh Tay</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TARGET BAND SCORE ROADMAP ================= */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Lộ trình Band Điểm Mục Tiêu (Target Bands)
              </h3>
              <p className="text-xs text-slate-500">
                Lọc nội dung học tập và bài thi theo đúng band điểm bạn hướng tới
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/learn?difficulty=BEGINNER"
            className="p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  Cơ bản
                </span>
                <span className="text-xs font-black text-emerald-700">Band 450 - 600</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                ~250 từ nền tảng công sở thường gặp nhất trong các tình huống văn phòng hàng ngày.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Học band này</span> →
            </span>
          </a>

          <a
            href="/learn?difficulty=INTERMEDIATE"
            className="p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900">
                  Bứt phá
                </span>
                <span className="text-xs font-black text-blue-700">Band 650 - 800</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                ~300 từ ngữ cảnh hợp đồng, tài chính, sản xuất, logistics và marketing.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Học band này</span> →
            </span>
          </a>

          <a
            href="/learn?difficulty=ADVANCED"
            className="p-4 rounded-2xl bg-purple-50/60 hover:bg-purple-50 border border-purple-200/80 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900">
                  Chinh phục
                </span>
                <span className="text-xs font-black text-purple-700">Band 850 - 990+</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                ~140 từ vựng nâng cao, bẫy từ đồng nghĩa trong Part 7 và các bài đọc dài.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Học band này</span> →
            </span>
          </a>
        </div>
      </div>

      {/* ================= REAL STATISTICS OVERVIEW ================= */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span>Thống kê học tập thực tế (Real Database Stats)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center border-t-2 border-t-blue-500">
            <span className="text-xs text-slate-500 font-medium">Tổng từ đã học</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{counts.totalLearned}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center border-t-2 border-t-emerald-500">
            <span className="text-xs text-slate-500 font-medium">Đã thuần thục (Mastered)</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{counts.mastered}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center border-t-2 border-t-indigo-500">
            <span className="text-xs text-slate-500 font-medium">Độ chính xác bài test</span>
            <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{stats.quizAccuracy}%</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center border-t-2 border-t-purple-500">
            <span className="text-xs text-slate-500 font-medium">Số lượt ôn tập</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalReviewSessions}</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center col-span-2 sm:col-span-1 border-t-2 border-t-rose-500">
            <span className="text-xs text-slate-500 font-medium">Từ hay làm sai</span>
            <a
              href="/difficult-words"
              className="text-2xl sm:text-3xl font-black text-rose-500 hover:text-rose-700 mt-1 block transition-colors"
            >
              {counts.difficultWordsCount}
            </a>
          </div>
        </div>
      </div>

      {/* ================= QUICK SHORTCUTS & DIFFICULT WORDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficult Words Teaser */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Từ vựng hay sai (My Difficult Words)</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 group"
            >
              <span>Xem danh sách & Luyện ngay</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bookmarked Words Teaser */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-amber-800">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Từ vựng đã lưu (My Vocabulary)</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 group"
            >
              <span>Xem các từ đã lưu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

