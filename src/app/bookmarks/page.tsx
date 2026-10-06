"use client";

import React, { useEffect, useState } from "react";
import { AudioButton } from "@/components/AudioButton";
import { Flashcard, FlashcardWord } from "@/components/Flashcard";
import { Bookmark, BookOpen, Trash2, ArrowRight } from "lucide-react";



interface BookmarkItem extends FlashcardWord {
  bookmarkId: string;
  bookmarkedAt: string;
}

export default function BookmarksPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drillMode, setDrillMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (wordId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== wordId));
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-6 sm:pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Từ vựng đã lưu (My Vocabulary)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách các từ vựng bạn đã đánh dấu sao để tra cứu và ôn tập riêng
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setDrillMode(!drillMode);
              setCurrentIndex(0);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>{drillMode ? "Xem dạng danh sách" : "Học qua Flashcard"}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Chưa có từ vựng nào được lưu</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khi học từ mới hoặc tra từ điển, bạn có thể nhấn biểu tượng ngôi sao để lưu từ vựng vào đây.
          </p>
          <div className="pt-2">
            <a
              href="/vocabulary"
              className="inline-flex px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Khám phá từ điển
            </a>
          </div>
        </div>
      ) : drillMode ? (
        /* Drill via Flashcard */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 max-w-xl mx-auto">
            <span>Từ {currentIndex + 1} / {items.length}</span>
            <button
              type="button"
              onClick={() => setDrillMode(false)}
              className="text-blue-600 hover:underline"
            >
              Thoát chế độ thẻ
            </button>
          </div>

          <Flashcard
            word={items[currentIndex]}
            mode="learn"
            onNext={() => {
              if (currentIndex < items.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                setDrillMode(false);
              }
            }}
            onPrev={currentIndex > 0 ? () => setCurrentIndex((prev) => prev - 1) : undefined}
          />
        </div>
      ) : (
        /* Grid of Bookmarked Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{item.word}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {item.partOfSpeech}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{item.pronunciation}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <AudioButton text={item.word} audioUrl={item.audioUrl} size="sm" />
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Bỏ lưu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-800 leading-snug">{item.meaningVi}</p>



                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{item.exampleSentence}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-600">{item.topic}</span>
                <span>{item.toeicParts}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
