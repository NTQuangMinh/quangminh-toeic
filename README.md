# Quang Minh TOEIC - Nền Tảng Học & Luyện Thi Từ Vựng TOEIC Thông Minh

> Website học, ghi nhớ, ôn tập và luyện thi từ vựng TOEIC thực chiến dành riêng cho người học Việt Nam.
> Tích hợp phương pháp **Lặp lại ngắt quãng (Spaced Repetition SM-2)**, thẻ Flashcard 3D hai giọng phát âm chuẩn US/UK, hệ thống đề thi trắc nghiệm thực tế bám sát cấu trúc ETS và Trợ lý Gia sư AI.

---

## 🚀 Tính Năng Chính (Key Features)

1. **Kho Dữ Liệu 692+ Từ Vựng TOEIC Thực Chiến**:
   - Bao quát toàn bộ 600 từ vựng TOEIC thiết yếu (từ `abide by` đến `yield`) theo chuẩn ETS.
   - Mỗi từ có đầy đủ: Loại từ, Phiên âm quốc tế IPA, Nghĩa tiếng Việt chuẩn ngữ cảnh, Câu ví dụ thực tế trong doanh nghiệp/văn phòng có kèm dịch nghĩa tiếng Việt, Cụm Collocations hay ra thi và Ghi chú bẫy đề thi.
   - Phân loại rõ ràng theo **20 chủ đề trọng điểm** (Office, Business, Contracts, Marketing, Travel, Banking, Human Resources,...) và **Part 1 đến Part 7**.

2. **Hệ Thống Đăng Ký & Đăng Nhập Riêng Biệt Cho Học Viên**:
   - Học viên tự tạo tài khoản cá nhân tại `/register` với mục tiêu học hàng ngày (10, 20 hoặc 30 từ/ngày).
   - Đăng nhập an toàn tại `/login` với xác thực JWT HttpOnly Cookie bảo mật cao, mật khẩu mã hóa PBKDF2 salt 10,000 vòng.
   - Toàn bộ tiến độ học, streak, từ khó, từ đã lưu và lịch sử làm bài kiểm tra được lưu trữ độc lập theo từng tài khoản.

3. **Phân Quyền Quản Trị Viên (Admin CMS) Bảo Mật Nghiêm Ngặt**:
   - Trang `/admin` chỉ dành riêng cho tài khoản Quản trị viên (`role === "ADMIN"`).
   - Học viên thông thường và khách vãng lai khi vào `/admin` sẽ bị chặn ngay lập tức với màn hình **403 - Giới Hạn Quyền Quản Trị**.
   - Các API thêm, sửa, xóa từ vựng (`POST`, `PUT`, `DELETE /api/vocabulary`) đều kiểm tra phân quyền chặt chẽ trên máy chủ.

4. **Flashcard 3D Thông Minh (Smart 3D Flashcards)**:
   - Mặt trước: Từ vựng, loại từ, phiên âm IPA, nút nghe phát âm **US** & **UK**, nút lật thẻ.
   - Mặt sau: Nghĩa tiếng Việt in đậm, định nghĩa tiếng Anh, câu ví dụ trong đề thi TOEIC kèm dịch nghĩa, danh sách collocations thông dụng.
   - Phím tắt tiện lợi: `Space` (Lật thẻ), `1 - 4` (Chấm điểm SM-2), Mũi tên trái/phải.

5. **Thuật Toán Lặp Lại Ngắt Quãng (SuperMemo SM-2 Spaced Repetition)**:
   - 4 mức độ nhớ: `Again` (< 10 phút), `Hard` (1 ngày), `Good` (4 ngày), `Easy` (7+ ngày).
   - Tự động tính toán ngày ôn tập tối ưu để chống lại đường cong quên lãng Ebbinghaus.

6. **Hệ Thống Luyện Thi Trắc Nghiệm TOEIC (Realistic Quiz Engine)**:
   - Tùy chọn số lượng câu: 10, 20 hoặc 30 câu hỏi.
   - 5 dạng câu hỏi thực chiến bám sát đề thi thật (Part 5 điền từ ngữ cảnh, dịch nghĩa Anh-Việt, Việt-Anh, nghe chọn từ).
   - Giải thích cặn kẽ đáp án, dịch nghĩa và các cụm collocation thường bẫy thí sinh.

7. **Trang Từ Vựng Hay Làm Sai (My Difficult Words)**:
   - Tự động phát hiện và tổng hợp các từ học viên làm sai trong bài thi hoặc chọn "Again" khi học thẻ.
   - Nút "Ôn lại ngay" giúp củng cố cấp tốc những từ còn yếu.

8. **Trợ Lý Gia Sư AI (AI Tutor & Smart Explainer)**:
   - Hỏi Gia sư AI trên từng từ vựng: giải thích ngữ cảnh, ví dụ mở rộng, phân biệt từ dễ nhầm lẫn và sinh câu hỏi trắc nghiệm tương tác.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Actions & API Routes.
- **Database & Storage**: Tích hợp sẵn Persistent Engine tự động lưu vào `data/db.json` (không cần cài database phức tạp) và sẵn sàng kết nối PostgreSQL qua Prisma ORM (`prisma/schema.prisma`).
- **Bảo Mật**: HttpOnly JWT Session Cookies, PBKDF2 Password Hashing, RBAC (Role-Based Access Control).

---

## 🌐 HƯỚNG DẪN HOST THẬT (PRODUCTION DEPLOYMENT GUIDE)

Ứng dụng **Quang Minh TOEIC** đã được cấu hình tối ưu để có thể host ngay lập tức lên môi trường Internet theo các phương án dưới đây:

### Cách 1: Host lên Vercel (Khuyên dùng - Nhanh nhất & Miễn phí)

1. Đẩy mã nguồn lên tài khoản GitHub / GitLab của bạn:
   ```bash
   git init
   git add .
   git commit -m "feat: release Quang Minh TOEIC v1.0"
   git remote add origin https://github.com/<your-username>/quangminh-toeic.git
   git push -u origin main
   ```
2. Truy cập [Vercel](https://vercel.com) và đăng nhập bằng GitHub.
3. Chọn **Add New...** ➜ **Project** ➜ Chọn kho lưu trữ `quangminh-toeic`.
4. Cấu hình Environment Variables:
   - `AUTH_SECRET`: Một chuỗi ký tự bí mật ngẫu nhiên bất kỳ (ví dụ: `quangminh-toeic-secret-key-2026`).
   - `NODE_ENV`: `production`
5. Nhấn **Deploy**. Sau 1 - 2 phút, trang web của bạn sẽ hoạt động trực tiếp tại địa chỉ tên miền dạng `https://quangminh-toeic.vercel.app`.

---

### Cách 2: Host lên Cloud VPS / Máy Chủ Riêng (Ubuntu / Debian / CentOS)

Nếu bạn có một máy chủ VPS (như DigitalOcean, Linode, AWS EC2, VPS Vietnix, v.v.):

1. **Cài đặt Node.js & Git trên máy chủ**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```

2. **Tải mã nguồn và cài dependencies**:
   ```bash
   git clone <link-kho-repo-cua-ban> /var/www/quangminh-toeic
   cd /var/www/quangminh-toeic
   npm install
   ```

3. **Build ứng dụng**:
   ```bash
   npm run build
   ```

4. **Chạy ứng dụng dưới dạng background service với PM2**:
   ```bash
   # Cài đặt công cụ quản lý tiến trình PM2
   sudo npm install -g pm2

   # Khởi động ứng dụng
   PORT=3000 pm2 start npm --name "quangminh-toeic" -- start

   # Thiết lập PM2 tự khởi động cùng hệ thống khi reboot
   pm2 startup
   pm2 save
   ```

5. **Cấu hình Nginx làm Reverse Proxy và cấp chứng chỉ SSL miễn phí (HTTPS)**:
   Tạo file cấu hình `/etc/nginx/sites-available/quangminhtoeic.com`:
   ```nginx
   server {
       server_name quangminhtoeic.com www.quangminhtoeic.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Kích hoạt và cài chứng chỉ HTTPS bằng Certbot:
   ```bash
   sudo ln -s /etc/nginx/sites-available/quangminhtoeic.com /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d quangminhtoeic.com -d www.quangminhtoeic.com
   ```

---

### Cách 3: Host lên Render / Railway

1. Đăng ký tài khoản tại [Railway.app](https://railway.app) hoặc [Render.com](https://render.com).
2. Tạo Web Service mới kết nối từ GitHub Repository.
3. Cài đặt các thông số:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Environment Variables**:
     - `PORT`: `3000`
     - `AUTH_SECRET`: `quangminh-toeic-jwt-secret-key`

---

## 🔐 Tài Khoản & Phân Quyền Hệ Thống

| Vai trò | Cách đăng nhập / sử dụng | Quyền hạn |
| :--- | :--- | :--- |
| **Học viên** | Tự đăng ký tại `/register` | Toàn quyền học tập, làm bài thi, lưu bookmark, xem tiến độ cá nhân. Không thể truy cập trang `/admin`. |
| **Quản trị viên** | Đăng nhập tài khoản Admin chuyên dụng | Có quyền truy cập `/admin` để kiểm tra danh mục từ vựng, thêm từ mới, chỉnh sửa thông tin hoặc xóa từ. |

---

## 🏃 Chạy Kiểm Thử Tự Động (Automated Testing)

Để kiểm tra độ toàn vẹn của hệ thống:

```bash
# Kiểm tra bộ test tích hợp toàn diện (26 bài test)
npm test

# Kiểm tra phân quyền học viên và bảo mật trang Admin
npx sucrase-node scripts/verify_auth_admin.ts
```

Chúc bạn triển khai trang web **Quang Minh TOEIC** thành công và giúp nhiều học viên đạt điểm cao trong kỳ thi TOEIC!
