"use client";

import React, { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { TOEIC_TOPICS } from "@/data/toeic-vocab-seed";
import {
  BarChart2,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";

interface ProgressData {
  user: {
    name: string;
    email: string;
    dailyGoalTarget: number;
  };
  streak: number;
  todayGoal: {
    targetWords: number;
    learnedWords: number;
    percentage: number;
  };
  counts: {
    totalLearned: number;
    mastered: number;
    learning: number;
    newWords: number;
  };
  stats: {
    quizAccuracy: number;
    totalReviewSessions: number;
    wordsLearnedThisWeek: number;
  };
  weeklyActivity: Array<{ date: string; dayLabel: string; count: number }>;
}

export default function ProgressPage() {
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
        console.error("Progress fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { streak, counts, stats, weeklyActivity, user } = data || {
    streak: 7,
    counts: { totalLearned: 15, mastered: 2, learning: 13, newWords: 105 },
    stats: { quizAccuracy: 86, totalReviewSessions: 18, wordsLearnedThisWeek: 73 },
    weeklyActivity: [],
    user: { name: "Người học", dailyGoalTarget: 20 },
  };

  const totalWords = counts.mastered + counts.learning + counts.newWords || 120;
  const masteredPct = Math.round((counts.mastered / totalWords) * 100);
  const learningPct = Math.round((counts.learning / totalWords) * 100);
  const newPct = Math.max(0, 100 - masteredPct - learningPct);

  // Find max count for weekly activity scaling
  const maxWeeklyCount = Math.max(1, ...weeklyActivity.map((w) => w.count));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-blue-600" />
          <span>Tiến độ học tập (Vocabulary Progress)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Theo dõi mức độ thẩm thấu từ vựng, độ chính xác bài kiểm tra và thói quen học tập hàng ngày
        </p>
      </div>

      {/* ================= 1. VOCABULARY PROGRESS BREAKDOWN ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Vocabulary Progress (Phân bố từ vựng)
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Tổng cộng: {totalWords} từ
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden flex p-0.5">
            <div
              style={{ width: `${masteredPct}%` }}
              title={`Mastered: ${counts.mastered} từ (${masteredPct}%)`}
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-700"
            />
            <div
              style={{ width: `${learningPct}%` }}
              title={`Learning: ${counts.learning} từ (${learningPct}%)`}
              className="bg-blue-600 h-full transition-all duration-700"
            />
            <div
              style={{ width: `${newPct}%` }}
              title={`New: ${counts.newWords} từ (${newPct}%)`}
              className="bg-slate-200 h-full rounded-r-full transition-all duration-700"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1">
            <span>Tổng từ đã tiếp xúc: <strong className="text-slate-900">{counts.totalLearned}</strong></span>
            <span>Tỷ lệ thuộc bài: <strong className="text-emerald-600">{masteredPct}%</strong></span>
          </div>
        </div>

        {/* 3 Categories Pills */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
              {counts.mastered}
            </span>
            <span className="text-xs font-bold text-emerald-900 mt-1 block">Mastered</span>
            <span className="text-[11px] text-emerald-700/70 block">Đã nhớ vĩnh viễn</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 block">
              {counts.learning}
            </span>
            <span className="text-xs font-bold text-blue-900 mt-1 block">Learning</span>
            <span className="text-[11px] text-blue-700/70 block">Đang trong chu kỳ SM-2</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-2xl sm:text-3xl font-black text-slate-600 block">
              {counts.newWords}
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">New</span>
            <span className="text-[11px] text-slate-500 block">Chưa bắt đầu học</span>
          </div>
        </div>
      </div>

      {/* ================= 2. HIGHLIGHT METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Chuỗi học tập</span>
            </div>
            <p className="text-3xl font-black text-amber-900 tracking-tight">
              {streak} Day Streak
            </p>
          </div>

          <div className="text-lg tracking-widest">
            {Array.from({ length: Math.min(7, Math.max(1, streak)) }).map((_, i) => (
              <span key={i} className="inline-block animate-pulse">🔥</span>
            ))}
          </div>

          <p className="text-[11px] text-amber-800/80">
            Duy trì học hàng ngày giúp phản xạ nhớ từ tăng gấp 3 lần.
          </p>
        </div>

        {/* Quiz Accuracy */}
        <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Quiz Accuracy</span>
            </div>
            <p className="text-3xl font-black text-blue-900 tracking-tight">
              {stats.quizAccuracy}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-blue-200/60 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.quizAccuracy}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block">Dựa trên các bài test trắc nghiệm</span>
          </div>

          <p className="text-[11px] text-blue-800/80">
            Tổng số phiên ôn tập: <strong>{stats.totalReviewSessions} lượt</strong>
          </p>
        </div>

        {/* Words Learned This Week */}
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Tuần này</span>
            </div>
            <p className="text-3xl font-black text-emerald-900 tracking-tight">
              {stats.wordsLearnedThisWeek} từ
            </p>
          </div>

          <p className="text-xs text-slate-600">
            Số từ bạn đã tiếp thu và hoàn thành ôn tập trong 7 ngày qua.
          </p>

          <a
            href="/learn"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Học thêm từ mới</span>
            <span>➜</span>
          </a>
        </div>
      </div>

      {/* ================= 3. WEEKLY ACTIVITY CHART ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              Biểu đồ học tập 7 ngày qua (Weekly Activity)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Số lượng từ vựng bạn đã học theo từng ngày</p>
          </div>
          <span className="text-xs font-bold text-blue-600">Thời gian thực (Real DB Data)</span>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-8 pb-2 flex items-end justify-between gap-2 sm:gap-4 h-48 border-b border-slate-100">
          {weeklyActivity.map((day, idx) => {
            const heightPct = Math.max(12, Math.round((day.count / maxWeeklyCount) * 100));
            const isToday = idx === weeklyActivity.length - 1;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Count tooltip on hover */}
                <span className="text-[10px] font-bold text-slate-600 mb-1 opacity-80 group-hover:opacity-100 group-hover:-translate-y-1 transition-all">
                  {day.count}
                </span>

                {/* Animated Bar */}
                <div
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${
                    isToday
                      ? "bg-blue-600 shadow-md shadow-blue-500/20"
                      : day.count > 0
                      ? "bg-blue-400/80 hover:bg-blue-500"
                      : "bg-slate-100"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />

                {/* Day Label */}
                <span
                  className={`text-xs font-bold mt-2 ${
                    isToday ? "text-blue-600 font-extrabold" : "text-slate-500"
                  }`}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
