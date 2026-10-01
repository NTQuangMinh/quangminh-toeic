"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User, Target, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dailyGoalTarget, setDailyGoalTarget] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          dailyGoalTarget,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại. Vui lòng thử lại.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const goalOptions = [
    { target: 10, label: "10 từ / ngày", desc: "Nhẹ nhàng (10p)" },
    { target: 20, label: "20 từ / ngày", desc: "Tiêu chuẩn (Khuyên dùng)" },
    { target: 30, label: "30 từ / ngày", desc: "Cấp tốc (30p)" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-slate-100/50 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 text-white items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 mb-3">
            QM
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tạo Tài Khoản Quang Minh TOEIC</h2>
          <p className="text-sm text-slate-500 mt-1">Lưu trữ lộ trình, chuỗi học tập và ôn tập từ vựng cá nhân của bạn</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và tên
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật khẩu (ít nhất 6 ký tự)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Daily Goal Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Mục tiêu học mỗi ngày của bạn</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map((opt) => {
                const isSelected = dailyGoalTarget === opt.target;
                return (
                  <button
                    key={opt.target}
                    type="button"
                    onClick={() => setDailyGoalTarget(opt.target)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-500"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                    }`}
                  >
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span>Đang tạo tài khoản...</span>
            ) : (
              <>
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <a href="/login" className="font-bold text-blue-600 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
