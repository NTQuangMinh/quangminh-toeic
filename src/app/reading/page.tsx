"use client";

import React, { useState } from "react";
import {
  TOEIC_READING_PASSAGES,
  ReadingPassageItem,
  AnnotatedWord,
} from "@/data/toeic-reading-passages";
import { AudioButton } from "@/components/AudioButton";
import { Confetti } from "@/components/Confetti";
import { playSuccessSound, playErrorSound, playFanfareSound } from "@/lib/sound-effects";
import {
  FileText,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Volume2,
} from "lucide-react";

export default function ReadingPage() {
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0);
  const [activeTooltipWord, setActiveTooltipWord] = useState<AnnotatedWord | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const passage: ReadingPassageItem = TOEIC_READING_PASSAGES[selectedPassageIndex];

  // Map of lowercase word to annotated word data for instant lookup
  const vocabMap = React.useMemo(() => {
    const map = new Map<string, AnnotatedWord>();
    passage.vocabularyList.forEach((v) => {
      map.set(v.word.toLowerCase(), v);
    });
    return map;
  }, [passage]);

  const handleSelectAnswer = (questionId: string, optionIdx: number, correctIdx: number) => {
    if (userAnswers[questionId] !== undefined) return; // already answered

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));

    if (optionIdx === correctIdx) {
      playSuccessSound();
      // Check if all questions of current passage are completed
      const nextAnswers = { ...userAnswers, [questionId]: optionIdx };
      const allCorrect = passage.questions.every((q) => nextAnswers[q.id] === q.correctIndex);
      if (allCorrect) {
        setShowCelebration(true);
        playFanfareSound();
      }
    } else {
      playErrorSound();
    }
  };

  const handleSwitchPassage = (idx: number) => {
    setSelectedPassageIndex(idx);
    setActiveTooltipWord(null);
    setUserAnswers({});
    setShowCelebration(false);
  };

  // Render paragraph with highlighted interactive clickable vocabulary words
  const renderInteractiveParagraph = (text: string) => {
    const words = text.split(/(\s+|[.,;!?()]+)/);

    return words.map((chunk, i) => {
      const clean = chunk.toLowerCase().replace(/[^a-z]/g, "");
      const vocab = vocabMap.get(clean);

      if (vocab) {
        const isCurrent = activeTooltipWord?.word.toLowerCase() === vocab.word.toLowerCase();
        return (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTooltipWord(isCurrent ? null : vocab)}
            className={`font-bold transition-all px-1.5 py-0.5 rounded-lg inline-flex items-center gap-1 cursor-pointer mx-0.5 ${
              isCurrent
                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/80"
            }`}
          >
            <span>{chunk}</span>
          </button>
        );
      }

      return <span key={i}>{chunk}</span>;
    });
  };

  const totalQuestions = passage.questions.length;
  const answeredCount = passage.questions.filter((q) => userAnswers[q.id] !== undefined).length;
  const correctCount = passage.questions.filter((q) => userAnswers[q.id] === q.correctIndex).length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-6 sm:pb-10">
      {showCelebration && <Confetti />}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3 sm:pb-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
            <span>Luyện Đọc Part 7 (Context Reading)</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Đọc đoạn văn bản công sở thực tế, chạm vào các từ được highlight để tra nghĩa và làm bài trắc nghiệm ETS
          </p>
        </div>

        {/* Passage Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 shrink-0">
          {TOEIC_READING_PASSAGES.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSwitchPassage(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                selectedPassageIndex === idx
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Bài đọc {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ================= INTERACTIVE VOCABULARY TOOLTIP CARD ================= */}
      {activeTooltipWord && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white border border-blue-200 shadow-lg shadow-blue-500/10 animate-in fade-in zoom-in-95 duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {activeTooltipWord.word}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {activeTooltipWord.partOfSpeech}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {activeTooltipWord.pronunciation}
              </span>
            </div>
            <p className="text-sm font-bold text-blue-900">
              ➜ Nghĩa: <span className="text-slate-900 font-extrabold">{activeTooltipWord.meaningVi}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <AudioButton text={activeTooltipWord.word} accent="US" size="sm" showLabel />
            <button
              type="button"
              onClick={() => setActiveTooltipWord(null)}
              className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ================= READING PASSAGE CONTAINER ================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
        {/* Document Header Metadata */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {passage.passageType}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {passage.date}
            </span>
          </div>

          {passage.sender && (
            <div className="flex gap-2">
              <span className="font-bold text-slate-500 w-16 shrink-0">From:</span>
              <span className="text-slate-800 font-semibold">{passage.sender}</span>
            </div>
          )}

          {passage.recipient && (
            <div className="flex gap-2">
              <span className="font-bold text-slate-500 w-16 shrink-0">To:</span>
              <span className="text-slate-800 font-semibold">{passage.recipient}</span>
            </div>
          )}

          {passage.subject && (
            <div className="flex gap-2 pt-1 border-t border-slate-200/40 font-bold text-slate-900">
              <span className="text-slate-500 w-16 shrink-0">Subject:</span>
              <span>{passage.subject}</span>
            </div>
          )}
        </div>

        {/* Paragraphs */}
        <div className="space-y-4 text-sm sm:text-base text-slate-800 leading-relaxed font-normal pt-2">
          {passage.paragraphs.map((p, idx) => (
            <p key={idx} className="leading-loose">
              {renderInteractiveParagraph(p)}
            </p>
          ))}
        </div>

        {/* Hint banner */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Chạm vào bất kỳ từ màu xanh nào để tra phiên âm, nghĩa và nghe đọc.</span>
          </span>
          <span className="font-bold text-blue-700 shrink-0">
            {passage.vocabularyList.length} từ trọng tâm
          </span>
        </div>
      </div>

      {/* ================= COMPREHENSION QUESTIONS ================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>Câu Hỏi Đọc Hiểu Part 7</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Đúng {correctCount} / {totalQuestions} câu
          </span>
        </div>

        <div className="space-y-4">
          {passage.questions.map((q, qIdx) => {
            const selectedOpt = userAnswers[q.id];
            const hasAnsweredQ = selectedOpt !== undefined;
            const isCorrectQ = selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                    {q.questionText}
                  </p>
                </div>

                {/* 4 Choices */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isTargetCorrect = optIdx === q.correctIndex;

                    let btnClass =
                      "bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100";

                    if (hasAnsweredQ) {
                      if (isTargetCorrect) {
                        btnClass =
                          "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs";
                      } else if (isSelected) {
                        btnClass = "bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs";
                      } else {
                        btnClass = "bg-slate-50/40 border-slate-100 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, optIdx, q.correctIndex)}
                        disabled={hasAnsweredQ}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all text-xs sm:text-sm font-semibold leading-relaxed ${btnClass}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            hasAnsweredQ && isTargetCorrect
                              ? "bg-emerald-600 text-white"
                              : hasAnsweredQ && isSelected
                              ? "bg-rose-500 text-white"
                              : "bg-white border border-slate-200 text-slate-700"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 break-words">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Explanation */}
                {hasAnsweredQ && (
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1 animate-in fade-in duration-200 ${
                      isCorrectQ
                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/90 border-rose-200 text-rose-950"
                    }`}
                  >
                    <p className="font-black flex items-center gap-1.5">
                      {isCorrectQ ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                          <span>Chính xác!</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                          <span>Chưa chính xác!</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs leading-relaxed opacity-90">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Switch Next Passage Button */}
        {selectedPassageIndex < TOEIC_READING_PASSAGES.length - 1 && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSwitchPassage(selectedPassageIndex + 1)}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Chuyển sang Bài đọc tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
