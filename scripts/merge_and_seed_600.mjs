import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CHUNK_1_TUPLES } from "./chunk1_data.mjs";
import { CHUNK_2_TUPLES } from "./chunk2_data.mjs";
import { CHUNK_3_TUPLES } from "./chunk3_data.mjs";
import { CHUNK_4_TUPLES } from "./chunk4_data.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dbFile = path.join(rootDir, "data", "db.json");

console.log("🚀 Starting TOEIC 600 Master Compilation...");

const all600Tuples = [
  ...CHUNK_1_TUPLES,
  ...CHUNK_2_TUPLES,
  ...CHUNK_3_TUPLES,
  ...CHUNK_4_TUPLES,
];

console.log(`✅ Loaded ${all600Tuples.length} tuples from chunks 1 - 4.`);

function tupleToVocabItem(t, idx) {
  const [
    word,
    partOfSpeech,
    pronunciation,
    meaningVi,
    meaningEn,
    topic,
    difficulty,
    exampleSentence,
    exampleTranslation,
    collocations,
    notes,
  ] = t;

  let toeicParts = "Part 5, Part 7";
  if (topic === "Transportation" || topic === "Travel") toeicParts = "Part 1, Part 3, Part 5";
  else if (topic === "Meetings" || topic === "Events") toeicParts = "Part 3, Part 4, Part 7";
  else if (topic === "Office") toeicParts = "Part 5, Part 6, Part 7";
  else if (topic === "Restaurants" || topic === "Hotels") toeicParts = "Part 2, Part 3, Part 7";
  else if (topic === "Manufacturing" || topic === "Technology") toeicParts = "Part 4, Part 5, Part 7";

  return {
    word,
    partOfSpeech,
    meaningVi,
    meaningEn,
    pronunciation,
    exampleSentence,
    exampleTranslation,
    difficulty,
    topic,
    toeicParts,
    collocations,
    notes,
    audioUrl: null,
  };
}

const vocab600List = all600Tuples.map((t, idx) => tupleToVocabItem(t, idx));

// Read existing db.json to preserve user accounts, learning progress, quiz results, etc.
let existingDb = null;
if (fs.existsSync(dbFile)) {
  try {
    existingDb = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
  } catch (e) {
    console.warn("Could not read db.json", e);
  }
}

// Convert vocab600List to DBVocabulary format
const now = new Date().toISOString();
const dbVocabs = vocab600List.map((v, idx) => ({
  id: `voc_${String(idx + 1).padStart(4, "0")}`,
  word: v.word,
  partOfSpeech: v.partOfSpeech,
  meaningVi: v.meaningVi,
  meaningEn: v.meaningEn,
  pronunciation: v.pronunciation,
  audioUrl: null,
  exampleSentence: v.exampleSentence,
  exampleTranslation: v.exampleTranslation,
  difficulty: v.difficulty,
  topic: v.topic,
  toeicParts: v.toeicParts,
  synonyms: null,
  antonyms: null,
  collocations: v.collocations,
  notes: v.notes,
  createdAt: now,
  updatedAt: now,
}));

// Also keep any non-overlapping words from existing DB if present
if (existingDb && existingDb.vocabularies) {
  const existingMap = new Map();
  dbVocabs.forEach((v) => existingMap.set(v.word.toLowerCase(), v));
  let extraCount = 0;
  for (const oldV of existingDb.vocabularies) {
    if (!existingMap.has(oldV.word.toLowerCase())) {
      extraCount++;
      dbVocabs.push({
        ...oldV,
        id: `voc_${String(dbVocabs.length + 1).padStart(4, "0")}`,
      });
    }
  }
  console.log(`Retained ${extraCount} additional existing vocabulary words.`);
}

console.log(`📚 Total compiled vocabulary: ${dbVocabs.length} words!`);

// Calculate topic word counts
const topicCounts = {};
for (const v of dbVocabs) {
  topicCounts[v.topic] = (topicCounts[v.topic] || 0) + 1;
}
console.log("Topic distribution:", topicCounts);

// Update db.json
const updatedDb = {
  users: existingDb?.users || [],
  vocabularies: dbVocabs,
  userVocabularies: existingDb?.userVocabularies || [],
  bookmarks: existingDb?.bookmarks || [],
  quizResults: existingDb?.quizResults || [],
  quizQuestions: existingDb?.quizQuestions || [],
  dailyGoals: existingDb?.dailyGoals || [],
  studyLogs: existingDb?.studyLogs || [],
};

fs.writeFileSync(dbFile, JSON.stringify(updatedDb, null, 2), "utf-8");
console.log(`✅ Saved ${dbVocabs.length} vocabulary words to data/db.json`);
