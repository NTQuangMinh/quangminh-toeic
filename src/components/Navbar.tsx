"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Gamepad2,
  Headphones,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{
    authenticated: boolean;
    user: { id: string; name: string; email: string; role: string } | null;
  } | null>(null);
  const [streak, setStreak] = useState<number>(7);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on route change
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    { href: "/vocabulary", label: "Từ điển", icon: Search },
    { href: "/progress", label: "Tiến độ", icon: BarChart2 },
  ];

  const extraLinks = [
    {
      href: "/match",
      label: "Game Nối từ",
      desc: "Luyện phản xạ tốc độ cao",
      icon: Gamepad2,
      color: "text-amber-500 bg-amber-50",
    },
    {
      href: "/listen",
      label: "Nghe rảnh tay",
      desc: "Hands-Free Audio Player",
      icon: Headphones,
      color: "text-indigo-500 bg-indigo-50",
    },
  ];

  const isExtraActive = pathname.startsWith("/match") || pathname.startsWith("/listen");

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all tracking-tight shrink-0">
            QM
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 whitespace-nowrap">
              Quang Minh <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TOEIC</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-full border border-blue-200/60 shadow-xs whitespace-nowrap">
              Pro
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
          {navLinks.slice(0, 4).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? "bg-blue-50/90 text-blue-700 font-bold shadow-xs border border-blue-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{link.label}</span>
              </a>
            );
          })}

          {/* Dropdown "Luyện thêm" (Game Nối từ & Nghe rảnh tay) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                isExtraActive
                  ? "bg-indigo-50 text-indigo-700 font-bold shadow-xs border border-indigo-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
              }`}
            >
              <Gamepad2 className={`w-4 h-4 shrink-0 ${isExtraActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span className="whitespace-nowrap">Luyện thêm</span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${moreMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {moreMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tiện ích học tập mới
                </div>
                {extraLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-900 font-bold"
                          : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold whitespace-nowrap">{item.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining Core Links: Từ điển, Tiến độ */}
          {navLinks.slice(4).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? "bg-blue-50/90 text-blue-700 font-bold shadow-xs border border-blue-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{link.label}</span>
              </a>
            );
          })}

          {session?.user?.role === "ADMIN" && (
            <a
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-purple-50/90 text-purple-700 font-bold shadow-xs border border-purple-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="whitespace-nowrap">Admin</span>
            </a>
          )}
        </nav>

        {/* Right Section: Streak & User profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Flame Streak Badge */}
          <a
            href="/progress"
            title={`${streak} ngày học liên tiếp`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200/80 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:border-amber-300/80 transition-all whitespace-nowrap shrink-0"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 animate-bounce shrink-0" />
            <span className="whitespace-nowrap font-bold">
              {streak} <span className="hidden sm:inline">ngày</span>
            </span>
          </a>

          {/* User Profile / Auth State */}
          {session?.authenticated && session.user ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className="hidden lg:flex flex-col text-right whitespace-nowrap shrink-0">
                <span className="text-xs font-bold text-slate-800 leading-tight whitespace-nowrap">
                  {session.user.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight font-medium whitespace-nowrap">
                  {session.user.role === "ADMIN" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all active:scale-95 shrink-0"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <a
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-50/90 transition-colors whitespace-nowrap shrink-0"
              >
                Đăng nhập
              </a>
              <a
                href="/register"
                className="text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md shadow-blue-500/25 transition-all active:scale-95 whitespace-nowrap shrink-0"
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
