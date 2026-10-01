"use client";

import React, { useState } from "react";
import { Sparkles, X, Send, Bot, Lightbulb, HelpCircle, FileText, CheckCircle2 } from "lucide-react";

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: {
    word: string;
    partOfSpeech: string;
    meaningVi: string;
    pronunciation: string;
    exampleSentence: string;
    exampleTranslation: string;
    topic?: string;
    collocations?: string | null;
  };
}

export function AITutorModal({ isOpen, onClose, word }: AITutorModalProps) {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [isBuiltIn, setIsBuiltIn] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (
    promptType: "explain_context" | "toeic_example" | "synonym_diff" | "toeic_question" | "custom",
    customText?: string
  ) => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.word,
          partOfSpeech: word.partOfSpeech,
          meaningVi: word.meaningVi,
          exampleSentence: word.exampleSentence,
          exampleTranslation: word.exampleTranslation,
          topic: word.topic,
          collocations: word.collocations || undefined,
          promptType,
          customQuestion: customText,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setResponse(data.reply);
        setIsBuiltIn(data.isBuiltIn);
      } else {
        setResponse("Xin lỗi, Trợ lý AI chưa thể xử lý yêu cầu lúc này. Vui lòng thử lại!");
      }
    } catch {
      setResponse("Không thể kết nối với hệ thống AI. Vui lòng kiểm tra lại kết nối mạng!");
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    {
      id: "explain_context" as const,
      label: "Tại sao dùng từ này?",
      icon: Lightbulb,
    },
    {
      id: "toeic_example" as const,
      label: "Thêm ví dụ TOEIC",
      icon: FileText,
    },
    {
      id: "synonym_diff" as const,
      label: "Phân biệt từ dễ nhầm",
      icon: HelpCircle,
    },
    {
      id: "toeic_question" as const,
      label: "Tạo câu hỏi trắc nghiệm",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                Gia sư AI TOEIC
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {isBuiltIn === false ? "Gemini AI" : "Smart Tutor"}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                Từ vựng: <span className="font-semibold text-slate-800">{word.word}</span> ({word.partOfSpeech} - {word.meaningVi})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Context Card */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-50/60 border-b border-blue-100/60 text-xs">
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mb-0.5">
            <span className="font-bold text-xs sm:text-sm text-blue-900">{word.word}</span>
            <span className="text-blue-600 font-mono text-[11px] sm:text-xs">{word.pronunciation}</span>
            <span className="text-slate-500 italic text-[11px]">({word.partOfSpeech})</span>
            <span className="font-medium text-slate-700">: {word.meaningVi}</span>
          </div>
          <p className="text-slate-600 italic text-[11px] sm:text-xs line-clamp-2">
            "{word.exampleSentence}"
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Quick Action Chips */}
          <div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Câu hỏi nhanh cho Gia sư:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleAsk(p.id)}
                    disabled={loading}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs font-medium text-left transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Icon className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Response Display */}
          {loading && (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 animate-spin mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">Gia sư AI đang soạn câu trả lời dễ hiểu nhất cho bạn...</p>
              <p className="text-xs text-slate-400 mt-1">Đang phân tích cấu trúc đề thi TOEIC</p>
            </div>
          )}

          {response && !loading && (
            <div className="p-5 bg-gradient-to-b from-purple-50/40 to-white rounded-xl border border-purple-100/80 shadow-sm animate-in fade-in duration-300">
              <div className="prose prose-sm text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Custom Question Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customInput.trim()) {
                handleAsk("custom", customInput);
                setCustomInput("");
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={`Đặt câu hỏi bất kỳ về "${word.word}"...`}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !customInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Hỏi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
