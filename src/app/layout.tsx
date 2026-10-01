import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "Quang Minh TOEIC - Học Từ Vựng TOEIC Chuyên Sâu Cùng Flashcard & SM-2",
  description:
    "Nền tảng học từ vựng TOEIC thông minh Quang Minh TOEIC dành riêng cho người Việt. Luyện nhớ từ hiệu quả với lặp lại ngắt quãng (Spaced Repetition SM-2), đề thi thực tế, phát âm chuẩn US/UK và Gia sư AI.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quang Minh TOEIC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50/50 font-sans text-slate-900 antialiased pb-20 md:pb-0">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
