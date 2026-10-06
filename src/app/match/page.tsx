"use client";

import React, { useEffect, useState, useRef } from "react";
import { Confetti } from "@/components/Confetti";
import { TOEIC_TOPICS } from "@/data/toeic-vocab-seed";
import { MatchCard } from "@/app/api/match/route";
import {
  Gamepad2,
  Timer,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  ArrowRight,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";

interface GameStats {
  matchedCount: number;
  totalPairs: number;
  errorCount: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number; // in milliseconds
  isFinished: boolean;
}

export default function MatchGamePage() {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter settings
  const [pairsCount, setPairsCount] = useState<number>(6);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedBand, setSelectedBand] = useState<string>("all");

  // Selection states
  const [firstSelected, setFirstSelected] = useState<MatchCard | null>(null);
  const [mismatchedIds, setMismatchedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());

  // Game stats
  const [stats, setStats] = useState<GameStats>({
    matchedCount: 0,
    totalPairs: 6,
    errorCount: 0,
    combo: 0,
    maxCombo: 0,
    timeElapsed: 0,
    isFinished: false,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Pronunciation helper
  const playWordAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startNewGame = async () => {
    // Clear any active timer
    if (timerRef.current) clearInterval(timerRef.current);

    setLoading(true);
    setFirstSelected(null);
    setMismatchedIds([]);
    setMatchedIds(new Set());
    setIsPlaying(false);

    setStats({
      matchedCount: 0,
      totalPairs: pairsCount,
      errorCount: 0,
      combo: 0,
      maxCombo: 0,
      timeElapsed: 0,
      isFinished: false,
    });

    try {
      const params = new URLSearchParams();
      params.set("pairs", pairsCount.toString());
      if (selectedTopic !== "all") params.set("topic", selectedTopic);
      if (selectedBand !== "all") params.set("difficulty", selectedBand);

      const res = await fetch(`/api/match?${params.toString()}`);
      const data = await res.json();

      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
        setVocabList(data.vocabItems || []);
      }
    } catch (err) {
      console.error("Failed to load match cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pairsCount, selectedTopic, selectedBand]);

  // Start stopwatch on first click
  const ensureTimerRunning = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      startTimeRef.current = Date.now() - stats.timeElapsed;
      timerRef.current = setInterval(() => {
        setStats((prev) => ({
          ...prev,
          timeElapsed: Date.now() - startTimeRef.current,
        }));
      }, 50);
    }
  };

  const handleCardClick = (card: MatchCard) => {
    // Ignore already matched or currently resolving cards
    if (matchedIds.has(card.id) || mismatchedIds.length > 0) return;

    // Start timer if not already running
    ensureTimerRunning();

    // If card is from word side, play sound
    if (card.type === "word") {
      playWordAudio(card.text);
    }

    // First card selected
    if (!firstSelected) {
      setFirstSelected(card);
      return;
    }

    // Tapped the exact same card -> deselect
    if (firstSelected.id === card.id) {
      setFirstSelected(null);
      return;
    }

    // Cannot match card with another card of the same type (word with word, or meaning with meaning)
    if (firstSelected.type === card.type) {
      // Just switch focus to this card
      setFirstSelected(card);
      return;
    }

    // Check match condition: same wordId
    if (firstSelected.wordId === card.wordId) {
      // MATCH SUCCESS!
      const newMatched = new Set(matchedIds);
      newMatched.add(firstSelected.id);
      newMatched.add(card.id);
      setMatchedIds(newMatched);

      const nextMatchedCount = stats.matchedCount + 1;
      const nextCombo = stats.combo + 1;
      const nextMaxCombo = Math.max(stats.maxCombo, nextCombo);
      const isComplete = nextMatchedCount === pairsCount;

      setStats((prev) => ({
        ...prev,
        matchedCount: nextMatchedCount,
        combo: nextCombo,
        maxCombo: nextMaxCombo,
        isFinished: isComplete,
      }));

      setFirstSelected(null);

      // If game is completed
      if (isComplete) {
        if (timerRef.current) clearInterval(timerRef.current);
        finishGame(nextMatchedCount);
      }
    } else {
      // MISMATCH
      setMismatchedIds([firstSelected.id, card.id]);
      setStats((prev) => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        combo: 0, // reset combo
      }));

      setTimeout(() => {
        setMismatchedIds([]);
        setFirstSelected(null);
      }, 700);
    }
  };

  const finishGame = async (matched: number) => {
    setSavingProgress(true);
    try {
      await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchedPairs: matched,
          timeSpent: Math.round(stats.timeElapsed / 1000),
        }),
      });
    } catch (err) {
      console.error("Failed to record match activity:", err);
    } finally {
      setSavingProgress(false);
    }
  };

  const formatTimer = (ms: number) => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const getRank = (ms: number, errors: number) => {
    const totalSec = ms / 1000;
    if (totalSec < 15 && errors === 0)
      return { title: "⚡ Thần Tốc Sấm Sét", desc: "Phản xạ từ vựng đỉnh cao như người bản xứ!", color: "text-amber-500" };
    if (totalSec < 25 && errors <= 2)
      return { title: "🏆 Bậc Thầy Phản Xạ", desc: "Trí nhớ thị giác siêu việt và tốc độ ấn tượng!", color: "text-blue-500" };
    if (totalSec < 40)
      return { title: "🎉 Hoàn Thành Xuất Sắc", desc: "Khả năng ghép từ vựng rất chuẩn xác!", color: "text-emerald-500" };
    return { title: "🌱 Chăm Chỉ Tiến Bộ", desc: "Thực hành thêm để cải thiện phản xạ nhanh hơn nữa!", color: "text-purple-500" };
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-28 sm:pb-12">
      {stats.isFinished && <Confetti />}

      {/* ================= HEADER & STATS BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/70 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Word Match <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Game</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Ghép từ tiếng Anh với nghĩa tiếng Việt nhanh nhất để phá vỡ kỷ lục!
              </p>
            </div>
          </div>
        </div>

        {/* Real-time stats widgets */}
        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <Timer className="w-4 h-4 text-blue-600 animate-pulse" />
            <div className="text-left font-mono font-black text-slate-900 text-sm sm:text-base tracking-tight">
              {formatTimer(stats.timeElapsed)}
            </div>
          </div>

          {/* Combo / Streak */}
          {stats.combo > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-black text-xs animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>{stats.combo}x</span>
            </div>
          )}

          {/* Restart button */}
          <button
            onClick={startNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 shrink-0"
            title="Làm mới ván chơi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ván mới</span>
          </button>
        </div>
      </div>

      {/* ================= FILTER & CONTROLS (Horizontally scrollable on mobile) ================= */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50/80 p-2 sm:p-3 rounded-2xl border border-slate-200/60 text-xs -mx-1 px-2 sm:mx-0 sm:px-3">
        <span className="font-bold text-slate-700 flex items-center gap-1 mr-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Bộ lọc:</span>
        </span>

        {/* Band Target Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs shrink-0">
          {[
            { id: "all", label: "Tất cả Band" },
            { id: "BEGINNER", label: "🟢 450 - 600" },
            { id: "INTERMEDIATE", label: "🔵 650 - 800" },
            { id: "ADVANCED", label: "🟣 850+" },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBand(b.id)}
              className={`px-2 py-1 sm:px-2.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 text-[11px] sm:text-xs ${
                selectedBand === b.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="whitespace-nowrap">{b.label}</span>
            </button>
          ))}
        </div>

        {/* Topic dropdown */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-white border border-slate-200 font-semibold text-slate-700 rounded-xl px-2.5 py-1.5 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden shrink-0 text-xs"
        >
          <option value="all">Tất cả chủ đề</option>
          {TOEIC_TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Pairs count */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs ml-auto shrink-0">
          {[
            { count: 6, label: "6 Cặp" },
            { count: 8, label: "8 Cặp" },
          ].map((p) => (
            <button
              key={p.count}
              onClick={() => setPairsCount(p.count)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap text-[11px] sm:text-xs ${
                pairsCount === p.count
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="whitespace-nowrap">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= GAMEPLAY BOARD ================= */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 py-8">
          {Array.from({ length: pairsCount * 2 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : stats.isFinished ? (
        /* ================= COMPLETION MODAL / HERO ================= */
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white border border-blue-500/30 shadow-2xl text-center space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              {getRank(stats.timeElapsed, stats.errorCount).title}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ghép Xong Toàn Bộ Thẻ!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {getRank(stats.timeElapsed, stats.errorCount).desc}
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời gian</span>
              <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
                {formatTimer(stats.timeElapsed)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Combo cao nhất</span>
              <span className="text-lg sm:text-xl font-black text-emerald-300">
                {stats.maxCombo}x
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lỗi sai</span>
              <span className="text-lg sm:text-xl font-black text-rose-300">
                {stats.errorCount}
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã ghi nhận +{pairsCount} từ vào Mục tiêu ngày và Chuỗi Streak của bạn!</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={startNewGame}
              className="px-6 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi Ván Mới Ngay</span>
            </button>
            <a
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all active:scale-95"
            >
              Về Trang Chủ
            </a>
          </div>
        </div>
      ) : (
        /* ================= CARDS GRID ================= */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
          {cards.map((card) => {
            const isMatched = matchedIds.has(card.id);
            const isSelected = firstSelected?.id === card.id;
            const isMismatched = mismatchedIds.includes(card.id);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`relative min-h-[110px] sm:h-32 rounded-2xl p-3 sm:p-4 flex flex-col justify-between select-none transition-all duration-300 cursor-pointer ${
                  isMatched
                    ? "opacity-0 scale-90 pointer-events-none"
                    : isMismatched
                    ? "bg-rose-50 border-2 border-rose-500 text-rose-900 shadow-md shadow-rose-500/20 animate-shake"
                    : isSelected
                    ? "bg-blue-50/90 border-2 border-blue-600 text-blue-950 shadow-lg shadow-blue-500/25 scale-[1.03]"
                    : "bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md active:scale-95 text-slate-800 shadow-xs"
                }`}
              >
                {/* Card Type Tag */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      card.type === "word"
                        ? "bg-blue-100/80 text-blue-700"
                        : "bg-emerald-100/80 text-emerald-700"
                    }`}
                  >
                    {card.type === "word" ? "English" : "Nghĩa tiếng Việt"}
                  </span>

                  {card.type === "word" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playWordAudio(card.text);
                      }}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Card Main Text */}
                <div className="my-auto">
                  <p
                    className={`font-black tracking-tight text-center ${
                      card.type === "word"
                        ? "text-base sm:text-lg text-slate-900"
                        : "text-xs sm:text-sm text-slate-700 font-semibold line-clamp-2"
                    }`}
                  >
                    {card.text}
                  </p>
                  {card.pronunciation && card.type === "word" && (
                    <p className="text-[11px] text-slate-400 text-center font-mono mt-0.5">
                      {card.pronunciation}
                    </p>
                  )}
                </div>

                {/* Card Sub badge */}
                <div className="text-[10px] text-slate-400 font-medium text-center truncate">
                  {card.partOfSpeech ? `${card.partOfSpeech} • ` : ""}
                  {card.topic}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guide hint footer */}
      <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900/80 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold">Mẹo nhỏ:</span> Chạm vào thẻ từ vựng tiếng Anh để nghe phát âm chuẩn bản xứ, sau đó chạm nhanh vào thẻ nghĩa tiếng Việt tương ứng. Ghép chuỗi liên tiếp không sai sẽ kích hoạt nhân đôi điểm Combo!
        </p>
      </div>
    </div>
  );
}
