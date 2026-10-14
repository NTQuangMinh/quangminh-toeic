import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbFile = path.join(rootDir, "data", "db.json");

console.log("=================================================================");
console.log("🔍 TOEIC VOCABULARY PLATFORM: DATA QUALITY VALIDATION SUITE");
console.log("=================================================================\n");

if (!fs.existsSync(dbFile)) {
  console.error("❌ Fatal: Database file not found at " + dbFile);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
const vocabs = db.vocabularies || [];

console.log(`📊 Total Vocabulary Entries: ${vocabs.length}`);

let errors = 0;
let warnings = 0;

// 1. Check count
if (vocabs.length < 600) {
  console.error(`❌ Error: Vocabulary count (${vocabs.length}) is below 600 target.`);
  errors++;
} else {
  console.log(`✅ [PASS] Minimum word threshold met: ${vocabs.length} entries (Target >= 600).`);
}

// 2. Check for duplicate words and duplicate IDs
const wordMap = new Map();
const idMap = new Map();

for (let i = 0; i < vocabs.length; i++) {
  const v = vocabs[i];
  const normalizedWord = (v.word || "").trim().toLowerCase();

  if (!normalizedWord) {
    console.error(`❌ Error at index ${i}: Empty or missing word.`);
    errors++;
  } else if (wordMap.has(normalizedWord)) {
    console.error(`❌ Error: Duplicate word "${normalizedWord}" at index ${i} (previous: ${wordMap.get(normalizedWord)})`);
    errors++;
  } else {
    wordMap.set(normalizedWord, i);
  }

  if (!v.id) {
    console.error(`❌ Error at index ${i}: Missing id for word "${v.word}".`);
    errors++;
  } else if (idMap.has(v.id)) {
    console.error(`❌ Error: Duplicate ID "${v.id}" at index ${i} (previous: ${idMap.get(v.id)})`);
    errors++;
  } else {
    idMap.set(v.id, i);
  }

  // Required field checks
  const requiredFields = [
    "partOfSpeech",
    "meaningVi",
    "pronunciation",
    "exampleSentence",
    "exampleTranslation",
    "topic",
    "difficulty",
    "toeicParts",
  ];

  for (const field of requiredFields) {
    if (!v[field] || typeof v[field] !== "string" || v[field].trim() === "") {
      console.error(`❌ Error on word "${v.word}": Missing or empty required field "${field}".`);
      errors++;
    }
  }

  // Difficulty enum check
  const validDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  if (!validDifficulties.includes(v.difficulty)) {
    console.error(`❌ Error on word "${v.word}": Invalid difficulty "${v.difficulty}".`);
    errors++;
  }

  // Pronunciation IPA check: should start and end with slashes /.../ or brackets [...]
  if (v.pronunciation && !v.pronunciation.startsWith("/") && !v.pronunciation.startsWith("[")) {
    warnings++;
  }
}

console.log(`✅ [PASS] Unique words verified: ${wordMap.size} distinct terms.`);
console.log(`✅ [PASS] Unique identifiers verified: ${idMap.size} distinct IDs.`);

// 3. Referential integrity
console.log("\n🔗 Checking Referential Integrity:");
const userVocabs = db.userVocabularies || [];
let brokenUV = 0;
for (const uv of userVocabs) {
  if (!idMap.has(uv.wordId)) {
    console.error(`❌ Broken reference in userVocabulary: wordId "${uv.wordId}" not found in vocabularies.`);
    brokenUV++;
    errors++;
  }
}
if (brokenUV === 0) {
  console.log(`  ✅ [PASS] UserVocabulary referential integrity: ${userVocabs.length} records verified.`);
}

const bookmarks = db.bookmarks || [];
let brokenBM = 0;
for (const bm of bookmarks) {
  if (!idMap.has(bm.wordId)) {
    console.error(`❌ Broken reference in bookmark: wordId "${bm.wordId}" not found in vocabularies.`);
    brokenBM++;
    errors++;
  }
}
if (brokenBM === 0) {
  console.log(`  ✅ [PASS] Bookmarks referential integrity: ${bookmarks.length} records verified.`);
}

// 4. Topic distribution
console.log("\n📚 Topic Distribution Analysis:");
const topicCounts = {};
for (const v of vocabs) {
  const t = v.topic || "Unknown";
  topicCounts[t] = (topicCounts[t] || 0) + 1;
}

const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
for (const [topic, count] of sortedTopics) {
  console.log(`  • ${topic.padEnd(20)}: ${count} words`);
}

console.log("\n=================================================================");
if (errors === 0) {
  console.log(`🏆 DATASET QUALITY PERFECT: 0 ERRORS (${warnings} minor IPA formatting notes).`);
  console.log("=================================================================\n");
  process.exit(0);
} else {
  console.error(`💥 DATA QUALITY FAILURE: Found ${errors} critical errors.`);
  console.log("=================================================================\n");
  process.exit(1);
}
