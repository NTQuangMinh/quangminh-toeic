"use client";

import React, { useEffect, useState, useRef } from "react";
import { TOEIC_TOPICS } from "@/data/toeic-vocab-seed";
import {
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Volume2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  Moon,
  ListMusic,
  Gauge,
  Radio,
  Shuffle,
} from "lucide-react";

interface ListenWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn?: string | null;
  pronunciation: string;
  exampleSentence: string;
  exampleTranslation: string;
  topic: string;
  difficulty: string;
  collocations?: string | null;
}

export default function ListenPage() {
  const [words, setWords] = useState<ListenWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [speakingPhase, setSpeakingPhase] = useState<"idle" | "word" | "meaning" | "example">("idle");
  const [speed, setSpeed] = useState<number>(1.0);
  const [accent, setAccent] = useState<"US" | "UK">("US");
  const [speakMeaning, setSpeakMeaning] = useState(true);
  const [speakExample, setSpeakExample] = useState(true);
  const [repeatMode, setRepeatMode] = useState<"all" | "one">("all");

  // Sleep timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedBand, setSelectedBand] = useState("all");

  // Learned counter
  const [listenedWordsCount, setListenedWordsCount] = useState(0);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentIdxRef = useRef(currentIndex);
  currentIdxRef.current = currentIndex;

  const wordsRef = useRef(words);
  wordsRef.current = words;

  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch vocabulary
  const fetchWords = async () => {
    setLoading(true);
    stopPlayback();
    setCurrentIndex(0);

    try {
      const params = new URLSearchParams();
      if (selectedTopic !== "all") params.set("topic", selectedTopic);
      if (selectedBand !== "all") params.set("difficulty", selectedBand);
      params.set("limit", "30");

      const res = await fetch(`/api/learn?${params.toString()}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setWords(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch words for listening:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [selectedTopic, selectedBand]);

  // 2. Sleep timer decrement
  useEffect(() => {
    if (sleepTimerSecondsLeft === null) return;

    if (sleepTimerSecondsLeft <= 0) {
      stopPlayback();
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerSecondsLeft]);

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerSecondsLeft(null);
    } else {
      setSleepTimerSecondsLeft(minutes * 60);
    }
  };

  // 3. Audio Sequence Engine
  const stopPlayback = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current);
    }
    setIsPlaying(false);
    setSpeakingPhase("idle");
  };

  const speakText = (text: string, lang: string, rate: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;

      // Pick preferred voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang === lang || v.lang.startsWith(lang.slice(0, 2)));
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    });
  };

  const playSequenceForIndex = async (index: number) => {
    const list = wordsRef.current;
    if (!list || list.length === 0 || index >= list.length) {
      stopPlayback();
      return;
    }

    const currentWord = list[index];
    if (!currentWord) return;

    // Step 1: English word
    setSpeakingPhase("word");
    const langEn = accent === "UK" ? "en-GB" : "en-US";
    await speakText(currentWord.word, langEn, 0.9 * speed);

    if (!isPlayingRef.current) return;

    // Wait 0.8s pause
    await new Promise((r) => {
      timerTimeoutRef.current = setTimeout(r, 800);
    });

    if (!isPlayingRef.current) return;

    // Step 2: Vietnamese meaning (if enabled)
    if (speakMeaning) {
      setSpeakingPhase("meaning");
      await speakText(currentWord.meaningVi, "vi-VN", 1.0 * speed);

      if (!isPlayingRef.current) return;

      await new Promise((r) => {
        timerTimeoutRef.current = setTimeout(r, 800);
      });
    }

    if (!isPlayingRef.current) return;

    // Step 3: Example sentence in English (if enabled)
    if (speakExample && currentWord.exampleSentence) {
      setSpeakingPhase("example");
      await speakText(currentWord.exampleSentence, langEn, 0.9 * speed);

      if (!isPlayingRef.current) return;

      await new Promise((r) => {
        timerTimeoutRef.current = setTimeout(r, 1300);
      });
    }

    if (!isPlayingRef.current) return;

    // Record word listened
    setListenedWordsCount((prev) => prev + 1);

    // Step 4: Advance to next word
    if (repeatMode === "one") {
      playSequenceForIndex(index);
    } else {
      const nextIndex = (index + 1) % list.length;
      setCurrentIndex(nextIndex);
      playSequenceForIndex(nextIndex);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      playSequenceForIndex(currentIndex);
    }
  };

  const handleNextWord = () => {
    if (words.length === 0) return;
    stopPlayback();
    const nextIdx = (currentIndex + 1) % words.length;
    setCurrentIndex(nextIdx);
    if (isPlayingRef.current) {
      setTimeout(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        playSequenceForIndex(nextIdx);
      }, 200);
    }
  };

  const handlePrevWord = () => {
    if (words.length === 0) return;
    stopPlayback();
    const prevIdx = (currentIndex - 1 + words.length) % words.length;
    setCurrentIndex(prevIdx);
    if (isPlayingRef.current) {
      setTimeout(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        playSequenceForIndex(prevIdx);
      }, 200);
    }
  };

  const currentWord = words[currentIndex];

  const formatSleepTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-28 sm:pb-12">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/70 pb-4 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Hands-Free <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Audio Player</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Chế độ nghe rảnh tay tự động: Ôn từ vựng không cần chạm màn hình!
            </p>
          </div>
        </div>

        {/* Sleep timer status */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {sleepTimerSecondsLeft !== null ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold shadow-xs">
              <Moon className="w-3.5 h-3.5" />
              <span>Hẹn giờ tắt: {formatSleepTimer(sleepTimerSecondsLeft)}</span>
              <button
                onClick={() => handleSetSleepTimer(null)}
                className="ml-1 text-slate-400 hover:text-purple-900 font-normal"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <Moon className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
              <button
                onClick={() => handleSetSleepTimer(10)}
                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
              >
                10p
              </button>
              <button
                onClick={() => handleSetSleepTimer(20)}
                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
              >
                20p
              </button>
              <button
                onClick={() => handleSetSleepTimer(30)}
                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
              >
                30p
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= FILTER STRIP (Horizontally scrollable on mobile) ================= */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50/80 p-2 sm:p-3 rounded-2xl border border-slate-200/60 text-xs -mx-1 px-2 sm:mx-0 sm:px-3">
        <span className="font-bold text-slate-700 flex items-center gap-1 mr-1 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Bộ lọc:</span>
        </span>

        {/* Band filter */}
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
                  ? "bg-indigo-600 text-white shadow-xs"
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
          className="bg-white border border-slate-200 font-semibold text-slate-700 rounded-xl px-2.5 py-1.5 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden shrink-0 text-xs"
        >
          <option value="all">Tất cả chủ đề</option>
          {TOEIC_TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* ================= AUDIO VISUALIZER HERO CARD ================= */}
      {loading ? (
        <div className="h-80 rounded-3xl bg-slate-200 animate-pulse" />
      ) : currentWord ? (
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-500/20 relative overflow-hidden space-y-6">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/10">
                {currentWord.topic}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {currentWord.difficulty === "BEGINNER"
                  ? "Band 450-600"
                  : currentWord.difficulty === "INTERMEDIATE"
                  ? "Band 650-800"
                  : "Band 850+"}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-400">
              Từ {currentIndex + 1} / {words.length}
            </div>
          </div>

          {/* Main Word Display */}
          <div className="text-center space-y-3 py-2">
            <div className="inline-flex items-center justify-center gap-2.5">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {currentWord.word}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-indigo-300/90 font-medium">
              <span className="font-semibold italic">{currentWord.partOfSpeech}</span>
              <span>•</span>
              <span className="font-mono">{currentWord.pronunciation}</span>
            </div>

            {/* Meaning with active highlight when speaking */}
            <div
              className={`inline-block px-5 py-2.5 rounded-2xl transition-all duration-300 max-w-xl mx-auto ${
                speakingPhase === "meaning"
                  ? "bg-indigo-600/30 border border-indigo-400/40 text-indigo-100 scale-105 shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 border border-white/10 text-slate-200"
              }`}
            >
              <p className="text-base sm:text-xl font-bold tracking-tight">
                {currentWord.meaningVi}
              </p>
            </div>
          </div>

          {/* Example Sentence Section */}
          <div
            className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 max-w-2xl mx-auto space-y-1.5 ${
              speakingPhase === "example"
                ? "bg-indigo-600/20 border border-indigo-400/40 text-white shadow-lg shadow-indigo-500/20"
                : "bg-white/5 border border-white/10 text-slate-300"
            }`}
          >
            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
              "{currentWord.exampleSentence}"
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium italic">
              → {currentWord.exampleTranslation}
            </p>
          </div>

          {/* Audio Wave Visualizer Pulse */}
          <div className="flex items-center justify-center gap-1.5 h-8">
            {[40, 75, 100, 60, 90, 45, 80, 55, 95, 70, 40].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying
                    ? "bg-gradient-to-t from-indigo-500 to-purple-400 animate-pulse"
                    : "bg-slate-700 h-2"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(8, (height * (i % 2 === 0 ? 0.9 : 1.2)) % 32)}px` : "6px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          {/* Speaking Phase Indicator Pill */}
          <div className="flex items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300/80 bg-white/5 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>
                {speakingPhase === "word"
                  ? "Đang phát âm từ tiếng Anh..."
                  : speakingPhase === "meaning"
                  ? "Đang đọc nghĩa tiếng Việt..."
                  : speakingPhase === "example"
                  ? "Đang đọc câu ví dụ minh họa..."
                  : isPlaying
                  ? "Đang sẵn sàng..."
                  : "Tạm dừng"}
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          Không có từ vựng nào phù hợp với bộ lọc đã chọn.
        </div>
      )}

      {/* ================= CONTROLLER DOCK ================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/40 space-y-4">
        {/* Main playback control buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={handlePrevWord}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-xs"
            title="Từ trước đó"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className={`w-16 h-16 rounded-3xl text-white flex items-center justify-center transition-all shadow-xl active:scale-95 ${
              isPlaying
                ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/30"
                : "bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 hover:scale-105"
            }`}
            title={isPlaying ? "Tạm dừng" : "Bắt đầu phát tự động"}
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-0.5" />}
          </button>

          <button
            onClick={handleNextWord}
            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-xs"
            title="Từ tiếp theo"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary options row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <Gauge className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            {[0.8, 1.0, 1.2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  speed === s ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Accent US/UK */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(["US", "UK"] as const).map((acc) => (
              <button
                key={acc}
                onClick={() => setAccent(acc)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  accent === acc ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {acc}
              </button>
            ))}
          </div>

          {/* Voice options toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeakMeaning(!speakMeaning)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                speakMeaning
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              Nghĩa tiếng Việt: {speakMeaning ? "Bật" : "Tắt"}
            </button>

            <button
              onClick={() => setSpeakExample(!speakExample)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                speakExample
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              Ví dụ: {speakExample ? "Bật" : "Tắt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
