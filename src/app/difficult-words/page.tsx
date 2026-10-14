"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AudioButton } from "@/components/AudioButton";
import { Flashcard } from "@/components/Flashcard";
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Filter,
  Flame,
  Brain,
  Tag,
  BookOpen,
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
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
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

  // Weakness Diagnostics Analysis
  const diagnostics = useMemo(() => {
    if (items.length === 0) return null;

    const topicMap: Record<string, { count: number; totalWrongs: number }> = {};
    const posMap: Record<string, { count: number; totalWrongs: number }> = {};
    let totalWrongsAll = 0;

    items.forEach((item) => {
      totalWrongsAll += item.wrongCount;

      // Group by topic
      const t = item.topic || "Chung";
      if (!topicMap[t]) topicMap[t] = { count: 0, totalWrongs: 0 };
      topicMap[t].count += 1;
      topicMap[t].totalWrongs += item.wrongCount;

      // Group by POS
      const pos = item.partOfSpeech.split(",")[0].trim().toLowerCase() || "other";
      if (!posMap[pos]) posMap[pos] = { count: 0, totalWrongs: 0 };
      posMap[pos].count += 1;
      posMap[pos].totalWrongs += item.wrongCount;
    });

    const sortedTopics = Object.entries(topicMap).sort(
      (a, b) => b[1].totalWrongs - a[1].totalWrongs
    );
    const weakestTopic = sortedTopics[0];

    const sortedPos = Object.entries(posMap).sort(
      (a, b) => b[1].totalWrongs - a[1].totalWrongs
    );

    return {
      totalWrongsAll,
      sortedTopics,
      weakestTopic: weakestTopic ? { name: weakestTopic[0], ...weakestTopic[1] } : null,
      sortedPos,
    };
  }, [items]);

  // Filter items by selected topic
  const filteredItems = useMemo(() => {
    if (selectedTopic === "all") return items;
    return items.filter((item) => item.topic === selectedTopic);
  }, [items, selectedTopic]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Từ vựng hay làm sai & Phân tích điểm yếu</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hệ thống chẩn đoán lỗi sai thông minh giúp bạn nhận diện và khắc phục lỗ hổng từ vựng TOEIC
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
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
          >
            <option value="most_wrong">Sai nhiều nhất (Most wrong)</option>
            <option value="lowest_accuracy">Tỷ lệ chính xác thấp nhất (Lowest accuracy)</option>
            <option value="most_overdue">Quá hạn ôn tập nhất (Most overdue)</option>
          </select>
        </div>
      </div>

      {/* Weakness Diagnostics Widget */}
      {!loading && diagnostics && items.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white border border-rose-500/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <Brain className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  Chẩn đoán lỗ hổng kiến thức (Weakness Diagnostic)
                </h2>
                <p className="text-[11px] text-slate-300">
                  Ghi nhận tổng cộng <strong className="text-rose-300 font-bold">{diagnostics.totalWrongsAll} lần chọn sai</strong> qua {items.length} từ vựng
                </p>
              </div>
            </div>

            <a
              href="/review?mode=all"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/30 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ôn tập toàn bộ từ khó ngay</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Weakest Topic */}
            {diagnostics.weakestTopic && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Chủ đề yếu nhất:
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30">
                    {diagnostics.weakestTopic.totalWrongs} lỗi
                  </span>
                </div>
                <div className="text-base font-black text-white">
                  {diagnostics.weakestTopic.name} ({diagnostics.weakestTopic.count} từ khó)
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  💡 Bạn thường nhầm lẫn các từ thuộc chủ đề này trong đề TOEIC. Nên tập trung luyện flashcards theo chủ đề {diagnostics.weakestTopic.name}.
                </p>
              </div>
            )}

            {/* Part of Speech Confusion */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Phân bổ loại từ hay sai:
              </span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {diagnostics.sortedPos.map(([pos, data]) => (
                  <span
                    key={pos}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-xs text-slate-200 border border-white/10"
                  >
                    <span className="font-bold uppercase">{pos}:</span>
                    <span className="text-rose-300 font-semibold">{data.totalWrongs} lỗi</span>
                    <span className="text-slate-400 text-[10px]">({data.count} từ)</span>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Nắm vững cách dùng từ loại giúp tránh bẫy ngữ pháp Part 5 & 6.
              </p>
            </div>
          </div>

          {/* Quick Topic Filter Chips */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Lọc chủ đề:
            </span>
            <button
              onClick={() => setSelectedTopic("all")}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedTopic === "all"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Tất cả ({items.length})
            </button>
            {diagnostics.sortedTopics.map(([topic, data]) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedTopic === topic
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {topic} ({data.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {selectedTopic !== "all"
              ? `Không có từ khó nào trong chủ đề "${selectedTopic}"!`
              : "Không có từ khó nào!"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {selectedTopic !== "all"
              ? "Bạn đã xử lý tốt các từ vựng thuộc nhóm chủ đề này."
              : "Bạn chưa làm sai từ vựng nào hoặc đã khắc phục hết các từ khó. Hãy tiếp tục làm thêm bài trắc nghiệm nhé!"}
          </p>
          <div className="pt-2">
            <a
              href="/practice"
              className="inline-flex px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Làm bài trắc nghiệm mới
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
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

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                    {item.topic}
                  </span>
                  <span>{item.toeicParts}</span>
                </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Ôn luyện từ hay làm sai
              </span>
              <button
                type="button"
                onClick={() => setActiveDrillWord(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
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
