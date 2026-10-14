"use client";

import React, { useState, useRef } from "react";
import {
  Flame,
  Award,
  Share2,
  Check,
  Copy,
  Download,
  X,
  Sparkles,
  Trophy,
} from "lucide-react";

interface ShareAchievementProps {
  userName: string;
  streak: number;
  totalLearned: number;
  mastered: number;
  predictedBand?: string;
}

export function ShareAchievementCard({
  userName,
  streak,
  totalLearned,
  mastered,
  predictedBand = "Band 650+",
}: ShareAchievementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const is7DayStreak = streak >= 7;
  const streakProgress = Math.min(100, Math.round((streak / 7) * 100));

  const shareText = `🎉 Tôi vừa duy trì chuỗi học tập ${streak} ngày liên tiếp và tích lũy ${totalLearned} từ vựng TOEIC (${mastered} từ thuần thục) trên Quang Minh TOEIC! Cùng bứt phá điểm số nhé! 🚀\n#QuangMinhTOEIC #TOEIC #HocTiengAnh`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Background gradient (Deep Indigo to Slate)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      bgGrad.addColorStop(0, "#0f172a");
      bgGrad.addColorStop(0.5, "#1e1b4b");
      bgGrad.addColorStop(1, "#090d16");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Decorative radial glow
      const glowGrad = ctx.createRadialGradient(900, 150, 10, 900, 150, 450);
      glowGrad.addColorStop(0, "rgba(99, 102, 241, 0.35)");
      glowGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Border outline
      ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, 1140, 570);

      // Header Tag
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("QUANG MINH TOEIC • CHỨNG NHẬN TIẾN ĐỘ HỌC TẬP", 70, 90);

      // Main Greeting & Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(userName || "Người học TOEIC", 70, 160);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "normal 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Đã đạt thành tích xuất sắc trên lộ trình chinh phục chứng chỉ TOEIC:", 70, 205);

      // 3 Stat Cards
      // Card 1: Streak
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(70, 250, 320, 180);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 250, 320, 180);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("🔥 CHUỖI HỌC TẬP", 95, 295);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px sans-serif";
      ctx.fillText(`${streak} Ngày`, 95, 365);

      ctx.fillStyle = "#fef3c7";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(is7DayStreak ? "Đã mở khóa huy hiệu 7-Day Master" : "Đang duy trì mỗi ngày", 95, 400);

      // Card 2: Words Learned
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(430, 250, 320, 180);
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.strokeRect(430, 250, 320, 180);

      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("📚 TỪ VỰNG TÍCH LŨY", 455, 295);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px sans-serif";
      ctx.fillText(`${totalLearned} Từ`, 455, 365);

      ctx.fillStyle = "#93c5fd";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`${mastered} từ đạt chuẩn Mastered SM-2`, 455, 400);

      // Card 3: Band Prediction
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(790, 250, 340, 180);
      ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
      ctx.strokeRect(790, 250, 340, 180);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("🎯 ƯỚC TÍNH NĂNG LỰC", 815, 295);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px sans-serif";
      ctx.fillText(predictedBand, 815, 365);

      ctx.fillStyle = "#a7f3d0";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("Mô hình AI ETS Predictor", 815, 400);

      // Footer
      const nowStr = new Date().toLocaleDateString("vi-VN");
      ctx.fillStyle = "#94a3b8";
      ctx.font = "18px sans-serif";
      ctx.fillText(`Cập nhật ngày: ${nowStr} • Học từ vựng thông minh cùng Spaced Repetition`, 70, 520);
      ctx.fillText("https://github.com/NTQuangMinh/quangminh-toeic", 70, 555);

      // Trigger download
      const link = document.createElement("a");
      link.download = `quangminh-toeic-achievement-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Failed to generate image:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Visual Badge Card in Dashboard / Progress Page */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              is7DayStreak
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30"
                : "bg-amber-100 text-amber-700 border border-amber-300"
            }`}
          >
            {is7DayStreak ? (
              <Trophy className="w-7 h-7 fill-white/20 animate-bounce" />
            ) : (
              <Flame className="w-7 h-7 text-orange-500 fill-orange-500" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {is7DayStreak
                  ? "🏆 Huy hiệu Chuỗi 7 Ngày (7-Day Streak Master)"
                  : "🔥 Thử thách Chuỗi 7 Ngày (7-Day Streak Challenge)"}
              </h4>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  is7DayStreak
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {is7DayStreak ? "Unlocked" : `${streak}/7 Ngày`}
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              {is7DayStreak
                ? "Chúc mừng bạn đã hoàn thành thử thách chuỗi 7 ngày liên tục! Thói quen học này giúp phản xạ từ vựng tăng vượt trội."
                : `Duy trì thêm ${Math.max(0, 7 - streak)} ngày nữa để mở khóa huy hiệu chiến binh chuyên cần và lưu kỷ niệm!`}
            </p>

            {/* Mini Progress Bar for Challenge */}
            {!is7DayStreak && (
              <div className="w-full max-w-xs bg-slate-200/70 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${streakProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all active:scale-95 shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ thành tích</span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">
                  Thẻ Thành Tích Học Tập (Achievement Card)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Achievement Preview Card (Zero-leakage, privacy friendly) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Quang Minh TOEIC • Achievement
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">Người học</span>
                <h4 className="text-2xl font-black text-white tracking-tight">{userName}</h4>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                  <span className="text-xs text-amber-300 font-bold block">Chuỗi học</span>
                  <span className="text-xl font-black text-white block mt-0.5">{streak} Ngày</span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                  <span className="text-xs text-blue-300 font-bold block">Từ đã học</span>
                  <span className="text-xl font-black text-white block mt-0.5">{totalLearned}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 text-center">
                  <span className="text-xs text-emerald-300 font-bold block">Ước tính</span>
                  <span className="text-xl font-black text-white block mt-0.5">{predictedBand}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 border-t border-white/10 pt-3">
                🔒 Thẻ chứng nhận này chỉ hiển thị thành tích học tập, không chia sẻ email hoặc thông tin nhạy cảm.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Đã sao chép nội dung!" : "Sao chép nội dung chia sẻ"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={downloading}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? "Đang tạo ảnh..." : "Tải ảnh thẻ thành tích"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
