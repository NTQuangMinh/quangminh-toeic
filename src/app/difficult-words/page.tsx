"use client";

import React, { useEffect, useState } from "react";
import { AudioButton } from "@/components/AudioButton";
import { Flashcard, FlashcardWord } from "@/components/Flashcard";
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface DifficultWordItem {
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
  wrongCount: number;
  correctCount: number;
  accuracy: number;
  interval: number;
  nextReviewAt?: string | null;
}

export default function DifficultWordsPage() {
  const [items, setItems] = useState<DifficultWordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"most_wrong" | "lowest_accuracy" | "most_overdue">("most_wrong");
  const [activeDrillWord, setActiveDrillWord] = useState<DifficultWordItem | null>(null);

  const fetchDifficultWords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/difficult-words?sortBy=${sortBy}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch difficult words:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDifficultWords();
  }, [sortBy]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Từ vựng hay làm sai (My Difficult Words)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp các từ bạn từng chọn "Again" hoặc trả lời sai trong bài trắc nghiệm
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="most_wrong">Sai nhiều nhất (Most wrong)</option>
            <option value="lowest_accuracy">Tỷ lệ chính xác thấp nhất (Lowest accuracy)</option>
            <option value="most_overdue">Quá hạn ôn tập nhất (Most overdue)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Không có từ khó nào!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bạn chưa làm sai từ vựng nào hoặc đã khắc phục hết các từ khó. Hãy tiếp tục làm thêm bài trắc nghiệm nhé!
          </p>
          <div className="pt-2">
            <a
              href="/practice"
              className="inline-flex px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Làm bài trắc nghiệm mới
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{item.word}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.partOfSpeech}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{item.pronunciation}</span>
                  </div>

                  <AudioButton text={item.word} audioUrl={item.audioUrl} size="sm" />
                </div>

                <p className="text-sm font-bold text-slate-800">{item.meaningVi}</p>

                {item.collocations && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    <span className="font-semibold">Cụm từ:</span> {item.collocations}
                  </p>
                )}
              </div>

              {/* Stats & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5 text-xs">
                  <span className="block font-bold text-red-600">
                    Sai {item.wrongCount} lần (Wrong {item.wrongCount} times)
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Độ chính xác: <strong className="text-slate-800">{item.accuracy}%</strong> ({item.correctCount}/{item.correctCount + item.wrongCount})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDrillWord(item)}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drill Single Word Flashcard Modal */}
      {activeDrillWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Đang ôn luyện từ hay làm sai
              </span>
              <button
                type="button"
                onClick={() => setActiveDrillWord(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Đóng
              </button>
            </div>

            <Flashcard
              word={activeDrillWord}
              mode="review"
              onRate={async (rating) => {
                await fetch("/api/review", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    wordId: activeDrillWord.id,
                    rating,
                  }),
                });
                setActiveDrillWord(null);
                fetchDifficultWords();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
