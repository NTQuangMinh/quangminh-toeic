import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbFile = path.join(rootDir, "data", "db.json");
const seedTsFile = path.join(rootDir, "src", "data", "toeic-vocab-seed.ts");

const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
const vocabs = db.vocabularies;

console.log(`Exporting ${vocabs.length} words to toeic-vocab-seed.ts...`);

// Topic counts
const counts = {};
for (const v of vocabs) {
  counts[v.topic] = (counts[v.topic] || 0) + 1;
}

const topics = [
  { id: "Office", name: "Văn phòng & Công sở", nameEn: "Office", icon: "Building2", count: counts["Office"] || 30 },
  { id: "Business", name: "Kinh doanh & Doanh nghiệp", nameEn: "Business", icon: "Briefcase", count: counts["Business"] || 30 },
  { id: "Meetings", name: "Cuộc họp & Hội nghị", nameEn: "Meetings", icon: "Users", count: counts["Meetings"] || 20 },
  { id: "Travel", name: "Du lịch & Đi lại", nameEn: "Travel", icon: "Plane", count: counts["Travel"] || 20 },
  { id: "Transportation", name: "Giao thông & Vận tải", nameEn: "Transportation", icon: "Truck", count: counts["Transportation"] || 20 },
  { id: "Hotels", name: "Khách sạn & Lưu trú", nameEn: "Hotels", icon: "Bed", count: counts["Hotels"] || 20 },
  { id: "Restaurants", name: "Nhà hàng & Ăn uống", nameEn: "Restaurants", icon: "Utensils", count: counts["Restaurants"] || 15 },
  { id: "Shopping", name: "Mua sắm & Bán lẻ", nameEn: "Shopping", icon: "ShoppingBag", count: counts["Shopping"] || 25 },
  { id: "Finance", name: "Tài chính & Ngân sách", nameEn: "Finance", icon: "DollarSign", count: counts["Finance"] || 30 },
  { id: "Banking", name: "Ngân hàng & Giao dịch", nameEn: "Banking", icon: "Landmark", count: counts["Banking"] || 15 },
  { id: "Marketing", name: "Tiếp thị & Quảng bá", nameEn: "Marketing", icon: "Megaphone", count: counts["Marketing"] || 25 },
  { id: "Sales", name: "Bán hàng & Doanh số", nameEn: "Sales", icon: "TrendingUp", count: counts["Sales"] || 20 },
  { id: "Human Resources", name: "Nhân sự & Phúc lợi", nameEn: "Human Resources", icon: "UserCheck", count: counts["Human Resources"] || 30 },
  { id: "Recruitment", name: "Tuyển dụng & Ứng tuyển", nameEn: "Recruitment", icon: "UserPlus", count: counts["Recruitment"] || 20 },
  { id: "Manufacturing", name: "Sản xuất & Nhà xưởng", nameEn: "Manufacturing", icon: "Factory", count: counts["Manufacturing"] || 25 },
  { id: "Technology", name: "Công nghệ & Kỹ thuật", nameEn: "Technology", icon: "Cpu", count: counts["Technology"] || 25 },
  { id: "Customer Service", name: "Chăm sóc khách hàng", nameEn: "Customer Service", icon: "Headphones", count: counts["Customer Service"] || 25 },
  { id: "Health", name: "Sức khỏe & Bảo hiểm", nameEn: "Health", icon: "Activity", count: counts["Health"] || 10 },
  { id: "Environment", name: "Môi trường & Năng lượng", nameEn: "Environment", icon: "Leaf", count: counts["Environment"] || 10 },
  { id: "Events", name: "Sự kiện & Triển lãm", nameEn: "Events", icon: "Calendar", count: counts["Events"] || 15 },
];

const seedItems = vocabs.map(v => ({
  word: v.word,
  partOfSpeech: v.partOfSpeech,
  meaningVi: v.meaningVi,
  meaningEn: v.meaningEn || "",
  pronunciation: v.pronunciation,
  exampleSentence: v.exampleSentence,
  exampleTranslation: v.exampleTranslation,
  difficulty: v.difficulty,
  topic: v.topic,
  toeicParts: v.toeicParts,
  collocations: v.collocations || undefined,
  notes: v.notes || undefined,
}));

const content = `export interface VocabSeedItem {
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn: string;
  pronunciation: string;
  audioUrl?: string;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  topic: string;
  toeicParts: string;
  synonyms?: string;
  antonyms?: string;
  collocations?: string;
  notes?: string;
}

export const TOEIC_TOPICS = ${JSON.stringify(topics, null, 2)};

export const TOEIC_PARTS = [
  { id: "Part 1", name: "Part 1: Photographs", desc: "Mô tả hình ảnh (Nghe)" },
  { id: "Part 2", name: "Part 2: Question - Response", desc: "Hỏi - Đáp tình huống (Nghe)" },
  { id: "Part 3", name: "Part 3: Conversations", desc: "Đối thoại ngắn (Nghe)" },
  { id: "Part 4", name: "Part 4: Short Talks", desc: "Bài phát biểu / Thông báo (Nghe)" },
  { id: "Part 5", name: "Part 5: Incomplete Sentences", desc: "Điền vào câu ngắn (Đọc & Ngữ pháp)" },
  { id: "Part 6", name: "Part 6: Text Completion", desc: "Điền vào đoạn văn (Đọc)" },
  { id: "Part 7", name: "Part 7: Reading Comprehension", desc: "Đọc hiểu email, thông báo, báo cáo" },
];

export const INITIAL_VOCABULARY: VocabSeedItem[] = ${JSON.stringify(seedItems, null, 2)};
`;

fs.writeFileSync(seedTsFile, content, "utf-8");
console.log(`✅ Successfully updated ${seedTsFile} with ${seedItems.length} vocabulary words!`);
