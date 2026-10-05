"use client";

import React, { useState, useEffect } from "react";
import { AudioButton } from "./AudioButton";
import { AITutorModal } from "./AITutorModal";
import { Bookmark, Sparkles, RotateCw, Check, ArrowRight, Tag, HelpCircle, Lightbulb } from "lucide-react";
import { SM2Rating } from "@/lib/sm2";

export interface FlashcardWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn?: string | null;
  pronunciation: string;
  audioUrl?: string | null;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: string;
  topic: string;
  toeicParts: string;
  synonyms?: string | null;
  antonyms?: string | null;
  collocations?: string | null;
  notes?: string | null;
  isBookmarked?: boolean;
}

interface FlashcardProps {
  word: FlashcardWord;
  mode?: "learn" | "review";
  onRate?: (rating: SM2Rating) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleBookmark?: (wordId: string) => void;
}

export function Flashcard({
  word,
  mode = "learn",
  onRate,
  onNext,
  onPrev,
  onToggleBookmark,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(!!word.isBookmarked);

  // Reset flipped state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setBookmarked(!!word.isBookmarked);
  }, [word.id, word.isBookmarked]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (mode === "review" && isFlipped) {
        if (e.key === "1") onRate?.("AGAIN");
        if (e.key === "2") onRate?.("HARD");
        if (e.key === "3") onRate?.("GOOD");
        if (e.key === "4") onRate?.("EASY");
      } else if (mode === "learn") {
        if (e.key === "ArrowRight") onNext?.();
        if (e.key === "ArrowLeft") onPrev?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, mode, onRate, onNext, onPrev]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    if (onToggleBookmark) {
      onToggleBookmark(word.id);
    } else {
      try {
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wordId: word.id }),
        });
      } catch (err) {
        console.error("Failed to toggle bookmark", err);
      }
    }
  };

  const collocationsList = word.collocations
    ? word.collocations.split(",").map((c) => c.trim())
    : [];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center select-none px-2 sm:px-0">
      {/* 3D Flashcard Container with Ambient Glow */}
      <div
        className="w-full min-h-[300px] sm:min-h-[440px] cursor-pointer perspective-1000 group relative"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Soft Ambient Radial Halo behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-purple-500/10 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

        <div
          className={`relative w-full h-full min-h-[300px] sm:min-h-[440px] duration-500 rounded-3xl transition-transform preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-b from-white via-white to-slate-50/60 rounded-3xl p-5 sm:p-8 flex flex-col justify-between border border-slate-200/80 shadow-xl shadow-slate-200/50 transition-opacity duration-300 ${
              isFlipped ? "z-10 pointer-events-none opacity-0" : "z-20 pointer-events-auto opacity-100"
            }`}
          >
            {/* Top Bar: Topic, TOEIC Parts & Bookmark */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50/90 text-blue-700 border border-blue-200/70 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  {word.topic}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                  {word.toeicParts.split(",")[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={handleBookmarkClick}
                className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-50/80 transition-all active:scale-90"
                title={bookmarked ? "Bỏ lưu từ này" : "Lưu từ vựng"}
              >
                <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${bookmarked ? "text-amber-500 fill-amber-500 scale-110" : ""}`} />
              </button>
            </div>

            {/* Center Content: Word, Part of Speech, Phonetics & Audio */}
            <div className="flex flex-col items-center justify-center my-auto text-center space-y-3 sm:space-y-4 px-2 py-4">
              <div className="inline-block px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60 shadow-xs">
                {word.partOfSpeech}
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors break-words max-w-full">
                {word.word}
              </h2>

              <p className="text-sm sm:text-lg text-slate-500 font-mono tracking-wide bg-slate-50/90 px-3.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
                {word.pronunciation}
              </p>

              {/* Audio US & UK buttons */}
              <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <AudioButton text={word.word} audioUrl={word.audioUrl} accent="US" size="md" showLabel />
                <AudioButton text={word.word} accent="UK" size="md" showLabel />
              </div>
            </div>

            {/* Bottom: Click to reveal indicator */}
            <div className="flex items-center justify-center pt-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100/80 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 text-[11px] sm:text-xs font-medium border border-slate-200/60 transition-all shadow-xs">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Chạm thẻ để xem nghĩa & ví dụ (Space)</span>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-3xl p-5 sm:p-8 flex flex-col justify-between border border-slate-200/80 shadow-xl shadow-slate-200/50 transition-opacity duration-300 ${
              isFlipped ? "z-20 pointer-events-auto opacity-100" : "z-10 pointer-events-none opacity-0"
            }`}
          >
            {/* Top Bar: Word Summary & Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900">{word.word}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                  {word.partOfSpeech}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">{word.pronunciation}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <AudioButton text={word.word} audioUrl={word.audioUrl} accent="US" size="sm" />
                <button
                  type="button"
                  onClick={handleBookmarkClick}
                  className="p-1.5 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? "text-amber-500 fill-amber-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Main Meaning (inner scroll container if needed) */}
            <div className="my-auto py-2.5 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(100%-80px)]">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs">
                <p className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                  {word.meaningVi}
                </p>

                {word.meaningEn && (
                  <p className="text-xs sm:text-sm text-blue-800/80 mt-1 font-medium italic">
                    {word.meaningEn}
                  </p>
                )}
              </div>

              {/* Realistic Example Sentence */}
              <div className="space-y-1 text-left bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ví dụ trong đề thi TOEIC:
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 italic leading-relaxed">
                  "{word.exampleSentence}"
                </p>
                <p className="text-xs text-slate-600 font-normal">
                  ➜ {word.exampleTranslation}
                </p>
              </div>

              {/* Collocations */}
              {collocationsList.length > 0 && (
                <div className="text-left space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cụm từ hay gặp (Collocations):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {collocationsList.map((col, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs hover:bg-emerald-100/70 transition-colors"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes / Tips */}
              {word.notes && (
                <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 font-medium">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Mẹo thi:</span> {word.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions: Ask AI & Flip back */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAIOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" />
                <span>Hỏi Gia sư AI</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Lật mặt trước</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTROLS BELOW FLASHCARD ================= */}
      <div className="w-full mt-6">
        {mode === "review" ? (
          /* Spaced Repetition SM-2 rating buttons */
          <div className="space-y-2">
            <p className="text-center text-xs font-semibold text-slate-500">
              Bạn nhớ từ này ở mức độ nào?
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onRate?.("AGAIN")}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-rose-50/90 hover:bg-rose-100 border border-rose-200/90 text-rose-700 font-bold transition-all active:scale-90 hover:shadow-md hover:shadow-rose-500/10"
              >
                <span className="text-xs sm:text-base">Again</span>
                <span className="text-[9px] sm:text-[10px] text-rose-600/80 font-normal mt-0.5">&lt; 10p</span>
                <span className="text-[10px] opacity-40 hidden sm:inline font-mono">(1)</span>
              </button>

              <button
                type="button"
                onClick={() => onRate?.("HARD")}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200/90 text-amber-800 font-bold transition-all active:scale-90 hover:shadow-md hover:shadow-amber-500/10"
              >
                <span className="text-xs sm:text-base">Hard</span>
                <span className="text-[9px] sm:text-[10px] text-amber-700/80 font-normal mt-0.5">1 ngày</span>
                <span className="text-[10px] opacity-40 hidden sm:inline font-mono">(2)</span>
              </button>

              <button
                type="button"
                onClick={() => onRate?.("GOOD")}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 text-blue-700 font-bold transition-all active:scale-90 hover:shadow-md hover:shadow-blue-500/10"
              >
                <span className="text-xs sm:text-base">Good</span>
                <span className="text-[9px] sm:text-[10px] text-blue-600/80 font-normal mt-0.5">4 ngày</span>
                <span className="text-[10px] opacity-40 hidden sm:inline font-mono">(3)</span>
              </button>

              <button
                type="button"
                onClick={() => onRate?.("EASY")}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-800 font-bold transition-all active:scale-90 hover:shadow-md hover:shadow-emerald-500/10"
              >
                <span className="text-xs sm:text-base">Easy</span>
                <span className="text-[9px] sm:text-[10px] text-emerald-700/80 font-normal mt-0.5">7 ngày</span>
                <span className="text-[10px] opacity-40 hidden sm:inline font-mono">(4)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Learn mode simple controls */
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="flex-1 py-3 px-3 sm:px-4 rounded-xl border border-slate-200/90 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 text-center shadow-xs"
            >
              Từ trước
            </button>

            <button
              type="button"
              onClick={onNext}
              className="flex-[2] py-3 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              <span>Đã hiểu từ này</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* AI Tutor Modal Drawer */}
      <AITutorModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} word={word} />
    </div>
  );
}

