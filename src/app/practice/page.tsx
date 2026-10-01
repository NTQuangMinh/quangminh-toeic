"use client";

import React, { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { AudioButton } from "@/components/AudioButton";
import { Confetti } from "@/components/Confetti";
import { TOEIC_TOPICS, TOEIC_PARTS } from "@/data/toeic-vocab-seed";
import { QuizQuestionItem } from "@/app/api/quiz/route";
import {
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Volume2,
  Tag,
  AlertTriangle,
} from "lucide-react";

export default function PracticePage() {
  // States: 'setup' | 'quiz' | 'result'
  const [stage, setStage] = useState<"setup" | "quiz" | "result">("setup");
  const [quizSize, setQuizSize] = useState<number>(10);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedPart, setSelectedPart] = useState<string>("all");

  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Result data
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [resultFilter, setResultFilter] = useState<"all" | "wrong">("all");

  const startQuiz = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("size", quizSize.toString());
      if (selectedTopic !== "all") params.set("topic", selectedTopic);
      if (selectedPart !== "all") params.set("toeicPart", selectedPart);

      const res = await fetch(`/api/quiz?${params.toString()}`);
      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setUserAnswers(new Array(data.questions.length).fill(-1));
        setCurrentQIndex(0);
        setSelectedOption(null);
        setHasAnsweredCurrent(false);
        setStage("quiz");
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (hasAnsweredCurrent) return; // Prevent re-answering
    setSelectedOption(idx);
    setHasAnsweredCurrent(true);

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQIndex] = idx;
    setUserAnswers(updatedAnswers);
  };

  const handleNextQuestion = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnsweredCurrent(false);
    } else {
      // Complete quiz and post results to DB
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          userAnswers,
          topic: selectedTopic !== "all" ? selectedTopic : undefined,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setFinalScore(data.result.score);
        setCorrectCount(data.result.correctCount);
        setWrongCount(data.result.wrongCount);
      } else {
        // Fallback calculation
        let correct = 0;
        questions.forEach((q, i) => {
          if (userAnswers[i] === q.correctIndex) correct++;
        });
        setCorrectCount(correct);
        setWrongCount(questions.length - correct);
        setFinalScore(Math.round((correct / questions.length) * 100));
      }
      setStage("result");
    } catch (err) {
      console.error("Failed to submit quiz results:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= 1. SETUP STAGE =================
  if (stage === "setup") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Luyện thi trắc nghiệm TOEIC
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Kiểm tra phản xạ từ vựng với các câu hỏi chuẩn format đề thi thật (Part 5, nghĩa từ, nghe và dịch).
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
          {/* Question Count Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Số lượng câu hỏi (Quiz Size)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 30].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setQuizSize(size)}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    quizSize === size
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-black shadow-sm ring-1 ring-emerald-500"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <span className="text-base sm:text-lg block">{size} câu</span>
                  <span className="text-[11px] text-slate-500 block font-normal">
                    {size === 10 ? "~ 5 phút" : size === 20 ? "~ 10 phút" : "~ 15 phút"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn chủ đề (Topic)
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tất cả chủ đề (Ngẫu nhiên 20 Topics)</option>
              {TOEIC_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameEn} ({t.name})
                </option>
              ))}
            </select>
          </div>

          {/* TOEIC Part Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Phần thi TOEIC (Part 1 - 7)
            </label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tất cả các Part (Toàn diện)</option>
              {TOEIC_PARTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={startQuiz}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Đang tạo bộ đề thi...</span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Bắt đầu làm bài test ({quizSize} câu)</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ================= 2. ACTIVE QUIZ GAMEPLAY =================
  if (stage === "quiz" && questions.length > 0) {
    const q = questions[currentQIndex];
    const isCorrect = selectedOption === q.correctIndex;

    const questionTypeLabels = {
      fill_blank: "Part 5: Điền từ vào chỗ trống",
      meaning: "Từ vựng: Ý nghĩa tiếng Việt",
      en_to_vi: "Dịch nghĩa: Anh ➜ Việt",
      vi_to_en: "Dịch nghĩa: Việt ➜ Anh",
      listening: "🎧 Luyện nghe phát âm",
    };

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Progress & Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              Câu {currentQIndex + 1} / {questions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {questionTypeLabels[q.type]}
            </span>
          </div>

          <ProgressBar
            current={currentQIndex + 1}
            total={questions.length}
            color="green"
            size="sm"
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
          {/* Audio Prompt for Listening question */}
          {q.type === "listening" && q.audioPrompt && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">Bấm nút để nghe phát âm:</span>
              <AudioButton text={q.audioPrompt} size="lg" accent="US" showLabel />
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {q.questionText}
            </h2>
          </div>

          {/* 4 Answer Options */}
          <div className="space-y-2.5">
            {q.options.map((opt, idx) => {
              const optionLabel = ["A", "B", "C", "D"][idx];
              let btnStyle = "bg-slate-50 border-slate-200/80 text-slate-800 hover:bg-slate-100/70";

              if (hasAnsweredCurrent) {
                if (idx === q.correctIndex) {
                  btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                } else if (idx === selectedOption) {
                  btnStyle = "bg-red-50 border-red-400 text-red-950 font-bold ring-2 ring-red-500/20";
                } else {
                  btnStyle = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnsweredCurrent}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all text-sm sm:text-base ${btnStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      hasAnsweredCurrent && idx === q.correctIndex
                        ? "bg-emerald-600 text-white"
                        : hasAnsweredCurrent && idx === selectedOption
                        ? "bg-red-500 text-white"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    {optionLabel}
                  </span>
                  <span className="flex-1 font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback Box after answering */}
          {hasAnsweredCurrent && (
            <div
              className={`p-4 rounded-2xl border space-y-2 animate-in fade-in duration-300 ${
                isCorrect
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  : "bg-red-50/80 border-red-200 text-red-950"
              }`}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-sm text-emerald-800">✓ Chính xác!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="font-extrabold text-sm text-red-800">
                      ✗ Chưa chính xác. Đáp án đúng là: {["A", "B", "C", "D"][q.correctIndex]}. {q.options[q.correctIndex]}
                    </span>
                  </>
                )}
              </div>

              {/* In-depth explanation & collocations */}
              <div className="pt-2 border-t border-slate-200/40 text-xs sm:text-sm space-y-1 text-slate-800">
                <p className="leading-relaxed">{q.explanation}</p>

                {q.collocations && (
                  <div className="pt-1.5 flex items-center gap-1.5 text-xs text-slate-700">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      <strong className="text-slate-900">Common expressions:</strong> {q.collocations}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next / Submit Button */}
          {hasAnsweredCurrent && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>
                  {currentQIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả bài test"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= 3. QUIZ RESULT SCREEN =================
  if (stage === "result") {
    const isAce = finalScore >= 90;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
        {isAce && <Confetti />}

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="inline-flex w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Quiz Complete 🎉
            </h1>
            <p className="text-sm text-slate-500">
              Kết quả bài luyện tập từ vựng TOEIC của bạn đã được lưu vào hệ thống
            </p>
          </div>

          {/* Score Circle / Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50/70 border border-blue-100 max-w-sm mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
              Điểm số (Score)
            </span>
            <span className="text-5xl font-black text-blue-900 tracking-tight block mt-1">
              {finalScore}%
            </span>
            <span className="text-sm text-slate-600 font-medium mt-1 block">
              {correctCount} / {questions.length} câu đúng
            </span>
          </div>

          {/* Correct / Incorrect Summary */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-xl font-black text-emerald-600 block">{correctCount}</span>
              <span className="text-xs font-semibold text-emerald-800">Correct (Đúng)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100">
              <span className="text-xl font-black text-red-500 block">{wrongCount}</span>
              <span className="text-xs font-semibold text-red-800">Incorrect (Sai)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {wrongCount > 0 && (
              <a
                href="/difficult-words"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Review Mistakes (Ôn câu sai)</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                setStage("setup");
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again (Làm lại đề mới)</span>
            </button>

            <a
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors text-center"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Question-by-Question Mistake Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">
              Xem lại chi tiết từng câu hỏi
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setResultFilter("all")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  resultFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Tất cả ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setResultFilter("wrong")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  resultFilter === "wrong" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Chỉ câu sai ({wrongCount})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const selected = userAnswers[idx];
              const isQCorrect = selected === q.correctIndex;

              if (resultFilter === "wrong" && isQCorrect) return null;

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-sm space-y-3 ${
                    isQCorrect ? "border-slate-200" : "border-red-200 ring-1 ring-red-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-500">Câu {idx + 1}:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isQCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isQCorrect ? "Đúng" : "Sai"}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400 font-semibold">{q.word}</span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">{q.questionText}</p>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-600">
                      Bạn đã chọn:{" "}
                      <span className={`font-bold ${isQCorrect ? "text-emerald-700" : "text-red-600"}`}>
                        {q.options[selected]}
                      </span>
                    </p>
                    {!isQCorrect && (
                      <p className="text-slate-600">
                        Đáp án đúng:{" "}
                        <span className="font-bold text-emerald-700">
                          {q.options[q.correctIndex]}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                    <p>{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
