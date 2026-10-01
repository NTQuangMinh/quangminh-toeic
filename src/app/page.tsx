import React from "react";
import { TOEIC_TOPICS, TOEIC_PARTS } from "@/data/toeic-vocab-seed";
import { WordIllustration } from "@/components/WordIllustration";
import {
  BookOpen,
  RotateCcw,
  GraduationCap,
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Volume2,
  Clock,
  Award,
} from "lucide-react";


export default function LandingPage() {
  const faqs = [
    {
      q: "Phương pháp lặp lại ngắt quãng (Spaced Repetition SM-2) giúp ích gì cho kỳ thi TOEIC?",
      a: "Não bộ con người thường quên tới 70% kiến thức mới sau 24 giờ (đường cong quên lãng Ebbinghaus). Thuật toán SuperMemo SM-2 tự động tính toán thời điểm vàng trước khi bạn chuẩn bị quên từ để đưa ra nhắc nhở (Again, Hard, Good, Easy), giúp chuyển từ vựng từ trí nhớ ngắn hạn vào trí nhớ vĩnh viễn.",
    },
    {
      q: "Bộ từ vựng được xây dựng dựa trên nguồn tài liệu nào?",
      a: "Tất cả các từ vựng, câu ví dụ và câu hỏi trắc nghiệm đều được chắt lọc từ các đề thi ETS TOEIC chính thống mới nhất, bao quát 20 chủ đề trọng tâm trong môi trường công sở quốc tế và phân chia rõ ràng theo các Part 1 - Part 7.",
    },
    {
      q: "Tôi có thể học trên điện thoại không?",
      a: "Hoàn toàn có thể! Quang Minh TOEIC được thiết kế tối ưu hóa cho thiết bị di động (Mobile-First), với thanh điều hướng tiện lợi ở cuối màn hình và thao tác lật thẻ flashcard dễ dàng bằng một tay.",
    },
    {
      q: "Ứng dụng có phát âm tiếng Anh chuẩn không?",
      a: "Tất cả từ vựng đều tích hợp đầy đủ hai giọng phát âm chuẩn bản xứ: Anh - Mỹ (US) và Anh - Anh (UK), bám sát đúng đặc thù nghe đa giọng trong các bài thi TOEIC Listening.",
    },
    {
      q: "Gia sư AI hoạt động như thế nào?",
      a: "Gia sư AI luôn sẵn sàng giải đáp tại chỗ: giải thích ngữ cảnh dùng từ, chỉ ra các bẫy thường gặp trong đề thi TOEIC, phân biệt các cặp từ dễ gây nhầm lẫn và tự động sinh câu hỏi luyện tập trực tiếp bằng tiếng Việt.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Nền tảng học từ vựng TOEIC thông minh số 1 cho người Việt</span>
          </div>

          {/* Main Title & Subtitle */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Master TOEIC Vocabulary
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Learn the vocabulary you need for the TOEIC exam with smart flashcards, spaced repetition and realistic practice questions.
          </p>

          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
            Tạm biệt học vẹt. Ghi nhớ sâu 1000+ từ vựng trọng tâm với thuật toán lặp lại ngắt quãng SM-2 và làm chủ bài thi TOEIC 600 - 990+.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="/vocabulary"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition-all hover:border-slate-300 flex items-center justify-center gap-2"
            >
              <span>Explore Vocabulary</span>
            </a>
          </div>

          {/* Interactive Feature Highlights Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/60">
            <div className="flex flex-col items-center p-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">20+</span>
              <span className="text-xs text-slate-500 mt-0.5">Chủ đề TOEIC trọng điểm</span>
            </div>
            <div className="flex flex-col items-center p-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">SM-2</span>
              <span className="text-xs text-slate-500 mt-0.5">Khoa học lặp lại ngắt quãng</span>
            </div>
            <div className="flex flex-col items-center p-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">US & UK</span>
              <span className="text-xs text-slate-500 mt-0.5">Phát âm chuẩn đa giọng</span>
            </div>
            <div className="flex flex-col items-center p-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">AI Tutor</span>
              <span className="text-xs text-slate-500 mt-0.5">Gia sư giải thích tiếng Việt</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Quy trình học tập khoa học
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Lộ trình 5 bước chinh phục từ vựng TOEIC
            </h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Hệ thống được thiết kế khép kín giúp bạn tiếp thu từ mới, ôn luyện đúng lúc và áp dụng ngay vào đề thi thật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Đăng nhập & Mục tiêu",
                desc: "Chọn mục tiêu ngày: 10, 20 hoặc 30 từ tùy theo thời gian biểu của bạn.",
                icon: BookOpen,
              },
              {
                step: "02",
                title: "Học qua Flashcard",
                desc: "Khám phá nghĩa, phát âm US/UK, collocations và ví dụ thực tế.",
                icon: Volume2,
              },
              {
                step: "03",
                title: "Ôn tập SM-2",
                desc: "Đánh giá mức độ nhớ: Again, Hard, Good, Easy để xếp lịch thông minh.",
                icon: RotateCcw,
              },
              {
                step: "04",
                title: "Luyện thi thực chiến",
                desc: "Làm bài test 5 dạng câu hỏi: điền câu, nghĩa, dịch và bài nghe.",
                icon: GraduationCap,
              },
              {
                step: "05",
                title: "Làm chủ từ khó",
                desc: "Trang 'Từ vựng hay sai' giúp bạn tập trung đào sâu lỗ hổng kiến thức.",
                icon: Award,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="text-2xl font-black text-blue-200 group-hover:text-blue-500 transition-colors mb-3">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= VOCABULARY TOPICS ================= */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                Kho chuyên đề toàn diện
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                20 Chủ đề từ vựng TOEIC thực chiến
              </h3>
              <p className="mt-2 text-slate-600 text-sm">
                Phân loại chi tiết theo các lĩnh vực kinh tế, văn phòng và giao thương quốc tế.
              </p>
            </div>
            <a
              href="/vocabulary"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Xem tất cả chuyên đề</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {TOEIC_TOPICS.map((topic) => (
              <a
                key={topic.id}
                href={`/vocabulary?topic=${encodeURIComponent(topic.id)}`}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-2 group-hover:scale-110 transition-transform">
                    {topic.nameEn.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {topic.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{topic.name}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{topic.count} từ vựng cốt lõi</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-blue-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LEARNING SYSTEM (SM-2 & FLASHCARD) ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text explanation */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Phương pháp ghi nhớ hàng đầu thế giới</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Ghi nhớ vĩnh viễn với Spaced Repetition (SM-2)
              </h3>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Thay vì cố gắng nhồi nhét hàng chục từ trong một đêm rồi quên sạch sau đó, thuật toán SM-2 sẽ theo dõi từng từ bạn học và phân lịch ôn tập vào đúng ngày bạn sắp quên:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Again (Quên từ)</h4>
                    <p className="text-xs text-slate-600">Đưa từ trở lại chu kỳ ôn ngắn (&lt; 10 phút hoặc ngày mai) để củng cố ngay lập tức.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Hard (Còn phân vân)</h4>
                    <p className="text-xs text-slate-600">Xếp lịch kiểm tra lại vào ngày hôm sau với hệ số dễ điều chỉnh vừa phải.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Good & Easy (Nhớ tốt)</h4>
                    <p className="text-xs text-slate-600">Giãn cách thời gian lên 4 ngày, 10 ngày, 21 ngày cho đến khi từ được công nhận là đã thuần thục (Mastered).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive UI Mock Preview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-700 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="flex items-center justify-between text-xs text-blue-100 mb-4">
                <span className="font-bold uppercase tracking-wider text-[11px] bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                  Mô phỏng Thẻ Flashcard 3D
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                  Hotels
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-xl space-y-3.5">
                {/* Visual Context Illustration */}
                <div className="w-full">
                  <WordIllustration word="accommodate" topic="Hotels" size="sm" className="h-28 sm:h-32" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">accommodate</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">verb</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">/əˈkɒmədeɪt/</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-100">
                  <p className="text-sm sm:text-base font-bold text-blue-950">Đáp ứng; cung cấp chỗ ở cho</p>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Ví dụ đề thi TOEIC:</p>
                  <p className="italic font-medium mt-0.5 text-slate-800">
                    "The conference hotel can comfortably accommodate up to 500 guests."
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    ➜ Khách sạn hội nghị có thể cung cấp chỗ ở cho tối đa 500 khách.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div className="text-center p-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/60">Again</div>
                  <div className="text-center p-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/60">Hard</div>
                  <div className="text-center p-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">Good</div>
                  <div className="text-center p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">Easy</div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-blue-100/90 font-medium">
                <span>🔥 Học mỗi ngày, duy trì streak</span>
                <span className="font-bold text-emerald-300">Đã thuần thục: 842 từ</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Câu hỏi thường gặp
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Giải đáp thắc mắc về phương pháp học
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2"
              >
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Sẵn sàng bứt phá điểm số TOEIC của bạn?
          </h3>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
            Bắt đầu bài học đầu tiên ngay hôm nay chỉ với 10 phút. Đăng ký hoàn toàn miễn phí và lưu giữ toàn bộ tiến trình học tập của bạn trên mọi thiết bị.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-base shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Tạo tài khoản học ngay
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-base border border-blue-400/40 transition-colors"
            >
              Đăng nhập tài khoản cũ
            </a>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 bg-slate-900 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              QM
            </div>
            <span className="font-bold text-sm text-slate-200">Quang Minh TOEIC</span>
          </div>

          <p>© 2026 Quang Minh TOEIC. Dành riêng cho học viên Việt Nam chuẩn bị thi TOEIC.</p>

          <div className="flex items-center gap-4">
            <a href="/vocabulary" className="hover:text-white transition-colors">
              Từ điển
            </a>
            <a href="/login" className="hover:text-white transition-colors">
              Đăng nhập
            </a>
            <a href="/register" className="hover:text-white transition-colors">
              Đăng ký
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
