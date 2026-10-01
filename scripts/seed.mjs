import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { INITIAL_VOCABULARY } from "../src/data/toeic-vocab-seed.ts";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dbFile = path.join(dataDir, "db.json");

console.log("🌱 Bắt đầu nạp dữ liệu từ vựng cho Quang Minh TOEIC...");

async function seed() {
  if (process.env.DATABASE_URL) {
    console.log("📡 Phát hiện DATABASE_URL! Đang kết nối tới PostgreSQL (Neon / Supabase)...");
    const prisma = new PrismaClient();

    try {
      console.log(`📦 Đang nạp ${INITIAL_VOCABULARY.length} từ vựng TOEIC vào Cloud Database...`);
      let count = 0;
      for (const vocab of INITIAL_VOCABULARY) {
        await prisma.vocabulary.upsert({
          where: { word: vocab.word.toLowerCase() },
          create: {
            word: vocab.word.toLowerCase(),
            partOfSpeech: vocab.partOfSpeech,
            meaningVi: vocab.meaningVi,
            meaningEn: vocab.meaningEn || null,
            pronunciation: vocab.pronunciation,
            audioUrl: vocab.audioUrl || null,
            exampleSentence: vocab.exampleSentence,
            exampleTranslation: vocab.exampleTranslation,
            difficulty: vocab.difficulty,
            topic: vocab.topic,
            toeicParts: vocab.toeicParts,
            synonyms: vocab.synonyms || null,
            antonyms: vocab.antonyms || null,
            collocations: vocab.collocations || null,
            notes: vocab.notes || null,
          },
          update: {
            meaningVi: vocab.meaningVi,
            exampleSentence: vocab.exampleSentence,
            exampleTranslation: vocab.exampleTranslation,
            collocations: vocab.collocations || null,
          },
        });
        count++;
        if (count % 100 === 0) {
          console.log(`  -> Đã nạp ${count}/${INITIAL_VOCABULARY.length} từ...`);
        }
      }

      console.log(`✅ Hoàn tất nạp ${count} từ vựng vào PostgreSQL!`);
      
      // Tạo tài khoản Admin mặc định
      const adminEmail = "admin@toeic.vn";
      // Hash PBKDF2 của mật khẩu 'admin123'
      const adminHash = "24d23460165a152f24f2ead873691ab7:8b01d205ee9bf6cc4d31dd379440d6750f79195c77755ce1527a00a5c1f758c26e22a43298da94bd53400a4ec66add093006dce9e842049d31296e8dca58020a";
      
      await prisma.user.upsert({
        where: { email: adminEmail },
        create: {
          email: adminEmail,
          name: "TOEIC Admin",
          passwordHash: adminHash,
          role: "ADMIN",
          dailyGoalTarget: 20,
        },
        update: {
          role: "ADMIN",
        },
      });
      console.log(`✅ Tài khoản Quản trị viên (admin@toeic.vn) đã được khởi tạo trong Cloud DB.`);

    } catch (error) {
      console.error("❌ Lỗi khi nạp dữ liệu vào PostgreSQL:", error);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log("💾 Không phát hiện DATABASE_URL. Kiểm tra cơ sở dữ liệu local (data/db.json)...");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(dbFile)) {
      try {
        const existingState = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
        console.log(`✅ Database local đang hoạt động tốt với ${existingState.vocabularies?.length || 0} từ vựng.`);
      } catch (err) {
        console.warn("Không thể đọc db.json hiện tại.");
      }
    }
  }

  console.log("✨ Hoàn tất tiến trình Seed Data!");
}

seed();
