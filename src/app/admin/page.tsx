"use client";

import React, { useEffect, useState } from "react";
import { TOEIC_TOPICS, TOEIC_PARTS } from "@/data/toeic-vocab-seed";
import {
  Shield,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  BookOpen,
} from "lucide-react";

interface AdminVocabItem {
  id: string;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn?: string | null;
  pronunciation: string;
  audioUrl?: string | null;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  topic: string;
  toeicParts: string;
  synonyms?: string | null;
  collocations?: string | null;
  notes?: string | null;
}

export default function AdminPage() {
  const [session, setSession] = useState<{ authenticated: boolean; user: any } | null>(null);
  const [items, setItems] = useState<AdminVocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminVocabItem | null>(null);

  // Form fields
  const [form, setForm] = useState({
    word: "",
    partOfSpeech: "noun",
    meaningVi: "",
    meaningEn: "",
    pronunciation: "",
    audioUrl: "",
    exampleSentence: "",
    exampleTranslation: "",
    difficulty: "INTERMEDIATE" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    topic: "Office",
    toeicParts: "Part 5",
    synonyms: "",
    collocations: "",
    notes: "",
  });

  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vocabulary?limit=100");
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check user session & load items only if ADMIN
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        if (data?.authenticated && data?.user?.role === "ADMIN") {
          fetchItems();
        }
      })
      .catch(() => setSession({ authenticated: false, user: null }))
      .finally(() => setSessionLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/vocabulary", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...form }),
        });
        const data = await res.json();
        if (res.ok) {
          setFormMsg({ type: "success", text: `Đã cập nhật từ "${form.word}" thành công!` });
          setEditingItem(null);
          fetchItems();
        } else {
          setFormMsg({ type: "error", text: data.error || "Lỗi khi cập nhật từ." });
        }
      } else {
        // Create new
        const res = await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setFormMsg({ type: "success", text: `Đã thêm từ mới "${form.word}" thành công!` });
          setForm({
            word: "",
            partOfSpeech: "noun",
            meaningVi: "",
            meaningEn: "",
            pronunciation: "",
            audioUrl: "",
            exampleSentence: "",
            exampleTranslation: "",
            difficulty: "INTERMEDIATE",
            topic: "Office",
            toeicParts: "Part 5",
            synonyms: "",
            collocations: "",
            notes: "",
          });
          setShowAddForm(false);
          fetchItems();
        } else {
          setFormMsg({ type: "error", text: data.error || "Lỗi khi thêm từ mới." });
        }
      }
    } catch {
      setFormMsg({ type: "error", text: "Lỗi kết nối máy chủ." });
    }
  };

  const handleDelete = async (id: string, word: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa từ vựng "${word}" không?`)) return;

    try {
      const res = await fetch(`/api/vocabulary?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert("Lỗi khi xóa từ.");
      }
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleEditClick = (item: AdminVocabItem) => {
    setEditingItem(item);
    setForm({
      word: item.word,
      partOfSpeech: item.partOfSpeech,
      meaningVi: item.meaningVi,
      meaningEn: item.meaningEn || "",
      pronunciation: item.pronunciation,
      audioUrl: item.audioUrl || "",
      exampleSentence: item.exampleSentence,
      exampleTranslation: item.exampleTranslation,
      difficulty: item.difficulty,
      topic: item.topic,
      toeicParts: item.toeicParts,
      synonyms: item.synonyms || "",
      collocations: item.collocations || "",
      notes: item.notes || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredItems = items.filter(
    (i) =>
      i.word.toLowerCase().includes(search.toLowerCase()) ||
      i.meaningVi.toLowerCase().includes(search.toLowerCase())
  );

  if (sessionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session?.authenticated || session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 text-center shadow-xl border border-red-100 space-y-4">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-50 text-red-600 items-center justify-center shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            403 - Giới Hạn Quyền Quản Trị
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khu vực này chỉ dành riêng cho Quản trị viên hệ thống Quang Minh TOEIC. Tài khoản học viên không có quyền truy cập khu vực này.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <a
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Về Bảng điều khiển học tập
            </a>
            <a
              href="/"
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-all"
            >
              Về Trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <span>Quản lý Nội dung Từ vựng (Admin CMS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm mới, sửa đổi, gán chủ đề và quản lý danh mục đề thi TOEIC
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          {showAddForm || editingItem ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{editingItem ? "Hủy chỉnh sửa" : showAddForm ? "Đóng form" : "Thêm từ vựng mới"}</span>
        </button>
      </div>

      {/* Message Alert */}
      {formMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold ${
            formMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {formMsg.text}
        </div>
      )}

      {/* Add / Edit Form */}
      {(showAddForm || editingItem) && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100 space-y-4 animate-in fade-in duration-200"
        >
          <h2 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            {editingItem ? `Chỉnh sửa từ: ${editingItem.word}` : "Thêm từ vựng mới"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Từ vựng (English Word) *
              </label>
              <input
                type="text"
                required
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                placeholder="accommodate"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Loại từ (Part of Speech) *
              </label>
              <select
                value={form.partOfSpeech}
                onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="verb">verb (động từ)</option>
                <option value="noun">noun (danh từ)</option>
                <option value="adjective">adjective (tính từ)</option>
                <option value="adverb">adverb (trạng từ)</option>
                <option value="phrase">phrase (cụm từ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phát âm IPA *
              </label>
              <input
                type="text"
                required
                value={form.pronunciation}
                onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
                placeholder="/əˈkɒmədeɪt/"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nghĩa tiếng Việt *
              </label>
              <input
                type="text"
                required
                value={form.meaningVi}
                onChange={(e) => setForm({ ...form, meaningVi: e.target.value })}
                placeholder="Đáp ứng; cung cấp chỗ ở cho"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Định nghĩa tiếng Anh (Meaning EN)
              </label>
              <input
                type="text"
                value={form.meaningEn}
                onChange={(e) => setForm({ ...form, meaningEn: e.target.value })}
                placeholder="Provide lodging or sufficient space for"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Câu ví dụ TOEIC *
              </label>
              <textarea
                required
                rows={2}
                value={form.exampleSentence}
                onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
                placeholder="The hotel can accommodate up to 300 guests."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Dịch câu ví dụ *
              </label>
              <textarea
                required
                rows={2}
                value={form.exampleTranslation}
                onChange={(e) => setForm({ ...form, exampleTranslation: e.target.value })}
                placeholder="Khách sạn có thể cung cấp chỗ ở cho tối đa 300 khách."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Chủ đề (Topic) *
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {TOEIC_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Phần thi TOEIC (Part) *
              </label>
              <input
                type="text"
                value={form.toeicParts}
                onChange={(e) => setForm({ ...form, toeicParts: e.target.value })}
                placeholder="Part 5,Part 7"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Độ khó (Difficulty)
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="BEGINNER">Cơ bản (Beginner)</option>
                <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
                <option value="ADVANCED">Nâng cao (Advanced)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Collocations (Cụm từ hay gặp)
              </label>
              <input
                type="text"
                value={form.collocations}
                onChange={(e) => setForm({ ...form, collocations: e.target.value })}
                placeholder="accommodate guests, accommodate needs"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Từ đồng nghĩa (Synonyms)
              </label>
              <input
                type="text"
                value={form.synonyms}
                onChange={(e) => setForm({ ...form, synonyms: e.target.value })}
                placeholder="house, lodge, fulfill"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Audio URL (Tùy chọn)
              </label>
              <input
                type="text"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                placeholder="https://... (để trống sẽ dùng TTS)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {editingItem ? "Lưu thay đổi" : "Lưu từ vựng"}
            </button>
          </div>
        </form>
      )}

      {/* Vocabulary List Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-slate-900">
            Danh mục từ vựng ({filteredItems.length} từ)
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Lọc từ vựng..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Từ vựng</th>
                <th className="py-3 px-3">Loại từ</th>
                <th className="py-3 px-3">Nghĩa tiếng Việt</th>
                <th className="py-3 px-3">Chủ đề</th>
                <th className="py-3 px-3">Part</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{item.word}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      {item.partOfSpeech}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{item.meaningVi}</td>
                  <td className="py-3 px-3 font-medium text-slate-600">{item.topic}</td>
                  <td className="py-3 px-3 text-slate-500">{item.toeicParts}</td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(item)}
                      className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.word)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
