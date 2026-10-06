"use client";

import React, { useEffect, useState } from "react";
import { AudioButton } from "@/components/AudioButton";
import { AITutorModal } from "@/components/AITutorModal";
import { TOEIC_TOPICS, TOEIC_PARTS } from "@/data/toeic-vocab-seed";
import {
  Search,
  Bookmark,
  Sparkles,
  Tag,
  Filter,
  Volume2,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from "lucide-react";



interface VocabItem {
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
}

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedPart, setSelectedPart] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Selected word for AI Tutor modal
  const [aiWord, setAiWord] = useState<VocabItem | null>(null);

  // Read URL query params on initial load (e.g. from landing page topic clicks)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topicParam = params.get("topic");
      if (topicParam) setSelectedTopic(topicParam);
    }
  }, []);

  // Fetch bookmarks for current user
  useEffect(() => {
    fetch("/api/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setBookmarkedIds(new Set(data.items.map((i: any) => i.id)));
        }
      })
      .catch(() => {});
  }, []);

  const fetchVocabulary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedTopic !== "all") params.set("topic", selectedTopic);
      if (selectedPart !== "all") params.set("toeicPart", selectedPart);
      if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty);
      params.set("limit", "100");

      const res = await fetch(`/api/vocabulary?${params.toString()}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Vocabulary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVocabulary();
    }, 250); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, selectedTopic, selectedPart, selectedDifficulty]);

  const toggleBookmark = async (wordId: string) => {
    const updated = new Set(bookmarkedIds);
    if (updated.has(wordId)) {
      updated.delete(wordId);
    } else {
      updated.add(wordId);
    }
    setBookmarkedIds(updated);

    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          <span>Từ điển TOEIC Chuyên sâu</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tra cứu hơn 100+ từ vựng chuẩn ETS theo tiếng Anh, nghĩa tiếng Việt, chủ đề và từng Part thi
        </p>
      </div>

      {/* Global Search & Filters Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo từ tiếng Anh (meeting), nghĩa tiếng Việt (họp, hoãn), hoặc cụm từ..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-sm"
          />
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Topic */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Chủ đề (Topic)
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả chủ đề (20 Topics)</option>
              {TOEIC_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameEn} ({t.name})
                </option>
              ))}
            </select>
          </div>

          {/* TOEIC Part */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Phần thi (Part)
            </label>
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả Part 1-7</option>
              {TOEIC_PARTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty / Band */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Target Band TOEIC
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">🎯 Tất cả Band Điểm</option>
              <option value="BEGINNER">🟢 Cơ bản (Band 450 - 600)</option>
              <option value="INTERMEDIATE">🔵 Bứt phá (Band 650 - 800)</option>
              <option value="ADVANCED">🟣 Chinh phục (Band 850+)</option>
            </select>
          </div>
        </div>

        {/* Quick Band Filter Pills & Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Lọc nhanh:</span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "BEGINNER", label: "🟢 450 - 600" },
              { id: "INTERMEDIATE", label: "🔵 650 - 800" },
              { id: "ADVANCED", label: "🟣 850+" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedDifficulty(b.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDifficulty === b.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/match"
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold flex items-center gap-1 transition-all"
            >
              🎮 Nối từ
            </a>
            <a
              href="/listen"
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 font-bold flex items-center gap-1 transition-all"
            >
              🎧 Nghe rảnh tay
            </a>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>Tìm thấy {total} từ vựng phù hợp</span>
        {(searchQuery || selectedTopic !== "all" || selectedPart !== "all" || selectedDifficulty !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedTopic("all");
              setSelectedPart("all");
              setSelectedDifficulty("all");
            }}
            className="text-blue-600 hover:underline"
          >
            Đặt lại tất cả bộ lọc
          </button>
        )}
      </div>

      {/* Vocabulary Cards Grid */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <p className="text-slate-600 text-sm">Không tìm thấy từ vựng nào khớp với tìm kiếm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((vocab) => {
            const isSaved = bookmarkedIds.has(vocab.id);
            const collocations = vocab.collocations
              ? vocab.collocations.split(",").map((c) => c.trim())
              : [];

            return (
              <div
                key={vocab.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Word, Part of Speech, Bookmark & Audio */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-slate-900">{vocab.word}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {vocab.partOfSpeech}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{vocab.pronunciation}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <AudioButton text={vocab.word} audioUrl={vocab.audioUrl} size="sm" />
                      <button
                        type="button"
                        onClick={() => toggleBookmark(vocab.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        title={isSaved ? "Bỏ lưu từ này" : "Lưu từ vựng"}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "text-amber-500 fill-amber-500" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Meaning */}
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      {vocab.meaningVi}
                    </p>


                    {vocab.meaningEn && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {vocab.meaningEn}
                      </p>
                    )}
                  </div>

                  {/* Example Sentence */}
                  <div className="p-3 rounded-xl bg-slate-50 text-xs space-y-1 border border-slate-100">
                    <p className="italic text-slate-700 font-medium">"{vocab.exampleSentence}"</p>
                    <p className="text-slate-500">➜ {vocab.exampleTranslation}</p>
                  </div>

                  {/* Collocations */}
                  {collocations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {collocations.slice(0, 3).map((col, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/50"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Badges & Ask AI */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {vocab.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                      {vocab.toeicParts.split(",")[0]}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAiWord(vocab)}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Hỏi AI</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Tutor Modal */}
      {aiWord && (
        <AITutorModal
          isOpen={!!aiWord}
          onClose={() => setAiWord(null)}
          word={aiWord}
        />
      )}
    </div>
  );
}
