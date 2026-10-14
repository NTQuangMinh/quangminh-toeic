# Quang Minh TOEIC - Nền Tảng Học & Luyện Thi Từ Vựng TOEIC Chuyên Nghiệp

> Nền tảng học tập, ghi nhớ, ôn tập và luyện thi từ vựng TOEIC thực chiến dành riêng cho người học Việt Nam.
> Tích hợp phương pháp **Lặp lại ngắt quãng (SuperMemo SM-2 Spaced Repetition)**, luyện phát âm AI, thẻ Flashcard 3D với bộ điều chỉnh tốc độ nghe, đề thi trắc nghiệm chống gian lận bám sát format ETS, đọc hiểu Part 7 tương tác và hệ thống chẩn đoán điểm yếu thông minh.

- **Production Live URL**: [https://quangminh-toeic.vercel.app](https://quangminh-toeic.vercel.app)
- **GitHub Repository**: [NTQuangMinh/quangminh-toeic](https://github.com/NTQuangMinh/quangminh-toeic)

---

## 🚀 Tính Năng Chính (Key Features)

### 1. 📚 Kho Dữ Liệu 692+ Từ Vựng TOEIC Thực Chiến
- Bao quát toàn bộ 600 từ vựng TOEIC cốt lõi (từ `abide by` đến `yield`) theo chuẩn ETS.
- Mỗi mục từ đầy đủ: Từ vựng, Loại từ, Phiên âm quốc tế IPA, Nghĩa tiếng Việt chuẩn ngữ cảnh công sở, Câu ví dụ thực tế kèm bản dịch, Cụm từ hay gặp (*Collocations*) và Bẫy đề thi (*Exam Traps*).
- Phân loại theo **20 chủ đề trọng điểm** (*Office, Business, Contracts, Marketing, Travel, Banking, Human Resources...*) và **Part 1 đến Part 7**.

### 2. 🧠 Thuật Toán Lặp Lại Ngắt Quãng Chuẩn SuperMemo SM-2
- 4 mức đánh giá phản xạ: `Again` (quên, reset chu kỳ), `Hard` (nhớ khó khăn, giãn cách ngắn), `Good` (nhớ tốt, giãn cách nhân hệ số easeFactor), `Easy` (thuộc làu, thăng hạng MASTERED).
- Tự động đồng bộ tiến trình học tập cả khi học Flashcard lẫn khi làm bài kiểm tra Quiz.

### 3. 🎙️ AI Voice Pronunciation & Audio Speed Controls
- **Luyện nói AI (Voice Assessment)**: Thu âm và chấm điểm phát âm tiếng Anh trực tiếp qua Web Speech API & thuật toán so khớp âm vị Levenshtein distance.
- **Tốc độ phát âm linh hoạt**: Chuyển đổi tốc độ `0.75x`, `1.0x`, `1.25x`, `1.5x` trực quan, ghi nhớ vào `localStorage` và đồng bộ tức thì trên toàn bộ giao diện.

### 4. 📄 Luyện Đọc Hiểu Đoạn Văn Part 7 ETS (Contextual Reading)
- Đọc các đoạn văn thương mại thực tế (*Business Memo, Email, Press Release*).
- **Interactive Word Popover**: Chạm vào từ vựng mục tiêu trong bài để xem nghĩa, phiên âm và nghe phát âm ngay tại chỗ.
- Đi kèm câu hỏi đọc hiểu kiểm tra khả năng suy luận ngữ cảnh.

### 5. 🎯 Dự Đoán Điểm TOEIC AI & Kế Hoạch Đếm Ngược Ngày Thi
- **AI Score Predictor**: Dự đoán điểm TOEIC (10 - 990) dựa trên số từ thành thạo, độ chính xác làm bài và chuỗi học tập kiên trì (*Streak*).
- **Exam Countdown & Study Pace Planner**: Đếm ngược số ngày thi thực tế, tự động tính toán số từ cần học mỗi ngày (ví dụ: `15 từ/ngày`) để cán mốc mục tiêu (`500+`, `650+`, `750+`, `850+`, `900+`).

### 6. ⚠️ Chẩn Đoán Lỗ Hổng Kiến Thức (Weakness Diagnostics)
- Phân tích và thống kê lỗi sai theo Chủ đề (*Weakest Topic*) và Loại từ (*Part of Speech*).
- Bộ lọc chủ đề linh hoạt cùng nút **Ôn tập cấp tốc 1-click** toàn bộ các từ hay làm sai.

### 7. 🔒 Bảo Mật & Phòng Thủ Toàn Diện (Security Hardened)
- **Sliding-window Rate Limiting**: Ngăn chặn tấn công brute-force dò mật khẩu và spam API.
- **HMAC Signed Quiz Tokens**: Đề thi được ký số mật mã; ngăn chặn hoàn toàn gian lận chỉnh sửa đáp án từ client.
- **Guest Session Isolation**: Cấp phát cookie bảo mật `toeic_guest_id` độc lập cho từng khách vãng lai, không bị ghi đè dữ liệu chéo.
- **OWASP Security Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **Atomic File Persistence**: Sử dụng `fs.renameSync` nguyên tử, triệt tiêu nguy cơ hỏng cơ sở dữ liệu nếu server gặp sự cố.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: Next.js 14.2 (App Router), React 18, TypeScript 5.4, Tailwind CSS v3.4, Lucide React.
- **Backend**: Next.js Route Handlers, Edge Middleware.
- **Database**:
  - *Serverless / Offline*: Atomic Persistent JSON Engine (`data/db.json`).
  - *Production Cloud*: PostgreSQL qua Prisma ORM (`prisma/schema.prisma`).
- **Audio & SFX**: Web Audio API Procedural Synthesizer (Zero-Latency, 100% offline).

---

## 💻 Cài Đặt & Chạy Môi Trường Phát Triển (Local Development)

### 1. Yêu cầu hệ thống
- Node.js version 18.18+ hoặc 20+ (Khuyên dùng v20 LTS).
- Trình quản lý gói: `npm` hoặc `pnpm`.

### 2. Các bước cài đặt
```bash
# 1. Clone repository
git clone https://github.com/NTQuangMinh/quangminh-toeic.git
cd quangminh-toeic

# 2. Cài đặt dependencies
npm install

# 3. Tạo file cấu hình môi trường từ mẫu
cp .env.example .env

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm.

---

## 🏃 Bộ Kiểm Thử Tự Động (Automated Testing Suite)

Dự án trang bị bộ kiểm thử tích hợp toàn diện gồm 48 kịch bản kiểm tra:

```bash
# Chạy toàn bộ test suites (48/48 tests PASS)
npm test

# Chạy riêng kịch bản 8 Critical User Journeys (End-to-End QA)
npm run test:journeys

# Chạy kiểm tra phân quyền & quản trị viên
npx sucrase-node scripts/verify_auth_admin.ts
```

---

## 🌐 Hướng Dẫn Triển Khai Production (Deployment Guide)

### Cách 1: Triển khai lên Vercel (Khuyên dùng)
1. Fork hoặc Push mã nguồn lên GitHub cá nhân.
2. Đăng nhập [Vercel](https://vercel.com) ➜ **Add New Project** ➜ Chọn kho `quangminh-toeic`.
3. Điền các biến môi trường tại tab **Environment Variables**:
   - `AUTH_SECRET`: Chuỗi ngẫu nhiên bí mật độ an toàn cao (ví dụ: `openssl rand -hex 32`).
   - `DATABASE_URL`: (Tùy chọn) Chuỗi kết nối PostgreSQL từ Neon / Supabase nếu muốn lưu database cloud. Nếu không cấu hình, ứng dụng tự động dùng Atomic Engine tích hợp sẵn.
   - `AI_API_KEY`: (Tùy chọn) Khóa API Google Gemini nếu muốn dùng AI trực tuyến (nếu để trống, hệ thống tự kích hoạt Gia sư AI ngoại tuyến tích hợp sẵn).
4. Bấm **Deploy**.

### Cách 2: Triển khai Docker & PostgreSQL
```bash
# Khởi động PostgreSQL container
docker-compose up -d

# Đẩy schema lên database
npm run prisma:push

# Nạp dữ liệu 692 từ vựng TOEIC vào PostgreSQL
npm run seed
```

---

## 🔐 Tài Khoản Kiểm Thử Mặc Định

| Tài khoản | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Học viên mẫu** | `demo@toeic.vn` | `demo123` | Toàn quyền học tập, làm bài thi, lưu bookmark, xem tiến độ. |
| **Quản trị viên** | `admin@toeic.vn` | `admin123` | Quản trị từ vựng tại `/admin` (Thêm, Sửa, Xóa). |
