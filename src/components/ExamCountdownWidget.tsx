"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Target, Clock, Edit2, Check, Sparkles, AlertCircle } from "lucide-react";

interface ExamCountdownWidgetProps {
  masteredWords: number;
  learningWords: number;
}

const SCORE_MILESTONES = [
  { score: 500, label: "500+ (Cơ bản)", wordsRequired: 400 },
  { score: 650, label: "650+ (Khá)", wordsRequired: 700 },
  { score: 750, label: "750+ (Mục tiêu chuẩn)", wordsRequired: 1000 },
  { score: 850, label: "850+ (Chuyên nghiệp)", wordsRequired: 1300 },
  { score: 950, label: "900-990 (Xuất sắc)", wordsRequired: 1600 },
];

export function ExamCountdownWidget({ masteredWords, learningWords }: ExamCountdownWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetScore, setTargetScore] = useState<number>(750);
  const [examDate, setExamDate] = useState<string>("");

  useEffect(() => {
    try {
      const savedScore = localStorage.getItem("toeic_exam_target_score");
      if (savedScore) {
        setTargetScore(parseInt(savedScore) || 750);
      }

      const savedDate = localStorage.getItem("toeic_exam_target_date");
      if (savedDate) {
        setExamDate(savedDate);
      } else {
        // Default to 60 days from today
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 60);
        const dateStr = defaultDate.toISOString().split("T")[0];
        setExamDate(dateStr);
      }
    } catch {
      // fallback
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("toeic_exam_target_score", String(targetScore));
      localStorage.setItem("toeic_exam_target_date", examDate);
    } catch {
      // ignore
    }
    setIsEditing(false);
  };

  const selectedMilestone =
    SCORE_MILESTONES.find((m) => m.score === targetScore) || SCORE_MILESTONES[2];

  const now = new Date();
  const targetTime = examDate ? new Date(examDate).getTime() : now.getTime();
  const diffMs = targetTime - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const wordsRemaining = Math.max(0, selectedMilestone.wordsRequired - masteredWords);
  const dailyPace = daysLeft > 0 ? Math.max(5, Math.ceil(wordsRemaining / daysLeft)) : 20;

  const progressPercent = Math.min(
    100,
    Math.round((masteredWords / selectedMilestone.wordsRequired) * 100)
  );

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              Kế hoạch kỳ thi TOEIC
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Mục tiêu: {targetScore}+ TOEIC
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
            >
              <Edit2 className="w-3 h-3" />
              {isEditing ? "Đóng" : "Cài đặt ngày thi"}
            </button>
          </div>

          {/* Countdown & Pace display */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Thời gian còn lại
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 mt-0.5">
                {daysLeft} <span className="text-xs font-medium text-slate-300">ngày</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-400" />
                Tiến độ từ vựng
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 mt-0.5">
                {progressPercent}%
                <span className="text-[11px] font-normal text-slate-300 ml-1.5">
                  ({masteredWords}/{selectedMilestone.wordsRequired})
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Tốc độ cần đạt
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
                {dailyPace} <span className="text-xs font-medium text-slate-300">từ / ngày</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Đích đến: {examDate ? new Date(examDate).toLocaleDateString("vi-VN") : "Chưa chọn"}</span>
              <span>{wordsRemaining === 0 ? "🎉 Đã đạt mục tiêu từ vựng!" : `Còn ${wordsRemaining} từ cần thành thạo`}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Editing Panel */}
          {isEditing && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-indigo-400/30 space-y-3.5 backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ngày thi dự kiến:
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mục tiêu điểm số:
                  </label>
                  <select
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {SCORE_MILESTONES.map((m) => (
                      <option key={m.score} value={m.score}>
                        {m.label} ({m.wordsRequired} từ)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Lưu kế hoạch thi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2.5 sm:self-center shrink-0 w-full sm:w-auto">
          <a
            href="/learn"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all text-center flex items-center justify-center gap-2"
          >
            <span>Học {dailyPace} từ hôm nay</span>
            <span>→</span>
          </a>
          <a
            href="/practice"
            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs border border-white/10 transition-all text-center"
          >
            Làm bài Test kiểm tra
          </a>
        </div>
      </div>
    </div>
  );
}
