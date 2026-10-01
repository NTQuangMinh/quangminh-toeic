"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, RotateCcw, GraduationCap, BarChart2 } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Trang chủ", icon: LayoutDashboard },
    { href: "/learn", label: "Học từ", icon: BookOpen },
    { href: "/review", label: "Ôn tập", icon: RotateCcw },
    { href: "/practice", label: "Luyện thi", icon: GraduationCap },
    { href: "/progress", label: "Tiến độ", icon: BarChart2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 px-1 shadow-[0_-2px_20px_rgba(0,0,0,0.06)] safe-area-pb">
      <div className="flex items-center justify-around h-[60px]">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 transition-all active:scale-90 ${
                isActive ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-700 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-200/50"
                    : "text-slate-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-sm" : ""}`} />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
