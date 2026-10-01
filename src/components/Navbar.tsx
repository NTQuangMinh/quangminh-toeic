"use client";

import React, { useEffect, useState } from "react";
import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  RotateCcw,
  GraduationCap,
  Search,
  BarChart2,
  Flame,
  User,
  LogOut,
  Shield,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{
    authenticated: boolean;
    user: { id: string; name: string; email: string; role: string } | null;
  } | null>(null);
  const [streak, setStreak] = useState<number>(7);

  useEffect(() => {
    // Check auth status
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false, user: null }));

    // Fetch streak count
    fetch("/api/user/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.streak) setStreak(data.streak);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession({ authenticated: false, user: null });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Sparkles },
    { href: "/learn", label: "Học từ", icon: BookOpen },
    { href: "/review", label: "Ôn tập", icon: RotateCcw },
    { href: "/practice", label: "Luyện thi", icon: GraduationCap },
    { href: "/vocabulary", label: "Từ điển TOEIC", icon: Search },
    { href: "/progress", label: "Tiến độ", icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all tracking-tight">
            QM
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base sm:text-xl tracking-tight text-slate-900">
              Quang Minh <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TOEIC</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-full border border-blue-200/60 shadow-xs">
              Pro
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50/90 text-blue-700 font-bold shadow-xs border border-blue-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {link.label}
              </a>
            );
          })}

          {session?.user?.role === "ADMIN" && (
            <a
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-purple-50/90 text-purple-700 font-bold shadow-xs border border-purple-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              Admin
            </a>
          )}
        </nav>

        {/* Right Section: Streak & User profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Flame Streak Badge */}
          <a
            href="/progress"
            title={`${streak} ngày học liên tiếp`}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/80 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:border-amber-300/80 transition-all"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{streak} <span className="hidden sm:inline">ngày</span></span>
          </a>

          {/* User Profile / Auth State */}
          {session?.authenticated && session.user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {session.user.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight font-medium">
                  {session.user.role === "ADMIN" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-50/90 transition-colors"
              >
                Đăng nhập
              </a>
              <a
                href="/register"
                className="text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md shadow-blue-500/25 transition-all active:scale-95"
              >
                Học ngay
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
