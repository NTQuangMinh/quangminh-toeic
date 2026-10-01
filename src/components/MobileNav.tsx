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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 transition-all active:scale-90 ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "text-blue-600" : "text-slate-500"}`}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
