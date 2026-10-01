import fs from "fs";
import path from "path";
import { INITIAL_VOCABULARY } from "../data/toeic-vocab-seed";
import { hashPassword } from "./auth";
import { PrismaClient } from "@prisma/client";

/* =========================================================================
   TYPES & PRISMA-COMPATIBLE INTERFACES
   ========================================================================= */

export type Role = "USER" | "ADMIN";
export type VocabStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  dailyGoalTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBVocabulary {
  id: string;
  word: string;
  partOfSpeech: string;
  meaningVi: string;
  meaningEn: string | null;
  pronunciation: string;
  audioUrl: string | null;
  exampleSentence: string;
  exampleTranslation: string;
  difficulty: Difficulty;
  topic: string;
  toeicParts: string;
  synonyms: string | null;
  antonyms: string | null;
  collocations: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBUserVocabulary {
  id: string;
  userId: string;
  wordId: string;
  status: VocabStatus;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  correctCount: number;
  wrongCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBBookmark {
  id: string;
  userId: string;
  wordId: string;
  createdAt: string;
}

export interface DBQuizResult {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  topic: string | null;
  completedAt: string;
}

export interface DBQuizQuestion {
  id: string;
  quizResultId: string;
  wordId: string | null;
  questionText: string;
  optionsJson: string;
  correctIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  explanation: string | null;
}

export interface DBDailyGoal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  targetWords: number;
  learnedWords: number;
  completed: boolean;
  updatedAt: string;
}

export interface DBStudyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  wordsCount: number;
  createdAt: string;
}

interface DatabaseState {
  users: DBUser[];
  vocabularies: DBVocabulary[];
  userVocabularies: DBUserVocabulary[];
  bookmarks: DBBookmark[];
  quizResults: DBQuizResult[];
  quizQuestions: DBQuizQuestion[];
  dailyGoals: DBDailyGoal[];
  studyLogs: DBStudyLog[];
}

/* =========================================================================
   PERSISTENCE LAYER (JSON FILE / MEMORY)
   ========================================================================= */

const DB_FILE = path.join(process.cwd(), "data", "db.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseState {
  const now = new Date().toISOString();
  const demoUserId = "usr_demo_vietnam_001";
  const adminUserId = "usr_admin_vietnam_001";

  // Pre-seed 2 standard accounts:
  // 1. demo@toeic.vn / demo123 (Learner)
  // 2. admin@toeic.vn / admin123 (Administrator)
  const defaultUsers: DBUser[] = [
    {
      id: demoUserId,
      email: "demo@toeic.vn",
      passwordHash: hashPassword("demo123"),
      name: "Nguyễn Văn Hùng",
      role: "USER",
      dailyGoalTarget: 20,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: adminUserId,
      email: "admin@toeic.vn",
      passwordHash: hashPassword("admin123"),
      name: "TOEIC Admin",
      role: "ADMIN",
      dailyGoalTarget: 20,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Convert initial seed vocab into DB items
  const vocabularies: DBVocabulary[] = INITIAL_VOCABULARY.map((v, idx) => ({
    id: `voc_${(idx + 1).toString().padStart(4, "0")}`,
    word: v.word,
    partOfSpeech: v.partOfSpeech,
    meaningVi: v.meaningVi,
    meaningEn: v.meaningEn || null,
    pronunciation: v.pronunciation,
    audioUrl: v.audioUrl || null,
    exampleSentence: v.exampleSentence,
    exampleTranslation: v.exampleTranslation,
    difficulty: v.difficulty,
    topic: v.topic,
    toeicParts: v.toeicParts,
    synonyms: v.synonyms || null,
    antonyms: v.antonyms || null,
    collocations: v.collocations || null,
    notes: v.notes || null,
    createdAt: now,
    updatedAt: now,
  }));

  // Create some realistic starter learning data for demo user
  const userVocabularies: DBUserVocabulary[] = [];
  const bookmarks: DBBookmark[] = [];

  // Seed demo progress: 15 words learned, 5 due for review, 2 mastered, 1 difficult word
  if (vocabularies.length >= 20) {
    // 5 due for review today (nextReviewAt set to past)
    for (let i = 0; i < 5; i++) {
      userVocabularies.push({
        id: `uv_${i + 1}`,
        userId: demoUserId,
        wordId: vocabularies[i].id,
        status: "REVIEW",
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        nextReviewAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        lastReviewedAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
        correctCount: 2,
        wrongCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 2 Mastered words
    for (let i = 5; i < 7; i++) {
      userVocabularies.push({
        id: `uv_${i + 1}`,
        userId: demoUserId,
        wordId: vocabularies[i].id,
        status: "MASTERED",
        easeFactor: 2.8,
        interval: 25,
        repetitions: 4,
        nextReviewAt: new Date(Date.now() + 20 * 86400 * 1000).toISOString(),
        lastReviewedAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
        correctCount: 5,
        wrongCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 8 In Learning mode
    for (let i = 7; i < 15; i++) {
      userVocabularies.push({
        id: `uv_${i + 1}`,
        userId: demoUserId,
        wordId: vocabularies[i].id,
        status: "LEARNING",
        easeFactor: 2.4,
        interval: 2,
        repetitions: 1,
        nextReviewAt: new Date(Date.now() + 86400 * 1000).toISOString(),
        lastReviewedAt: new Date().toISOString(),
        correctCount: 1,
        wrongCount: i === 7 ? 2 : 0, // i=7 has mistakes
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3 bookmarked words
    bookmarks.push(
      { id: "bm_1", userId: demoUserId, wordId: vocabularies[0].id, createdAt: now },
      { id: "bm_2", userId: demoUserId, wordId: vocabularies[2].id, createdAt: now },
      { id: "bm_3", userId: demoUserId, wordId: vocabularies[6].id, createdAt: now }
    );
  }

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const dailyGoals: DBDailyGoal[] = [
    {
      id: "dg_demo_today",
      userId: demoUserId,
      date: todayStr,
      targetWords: 20,
      learnedWords: 15,
      completed: false,
      updatedAt: now,
    },
  ];

  // 7-day study activity logs for streak and chart
  const studyLogs: DBStudyLog[] = [];
  for (let d = 6; d >= 0; d--) {
    const logDate = new Date(Date.now() - d * 86400 * 1000).toISOString().split("T")[0];
    studyLogs.push({
      id: `sl_${d}`,
      userId: demoUserId,
      date: logDate,
      wordsCount: d === 0 ? 15 : 18 + Math.floor(Math.sin(d) * 4),
      createdAt: now,
    });
  }

  return {
    users: defaultUsers,
    vocabularies,
    userVocabularies,
    bookmarks,
    quizResults: [],
    quizQuestions: [],
    dailyGoals,
    studyLogs,
  };
}

let cachedState: DatabaseState | null = null;

function loadState(): DatabaseState {
  if (cachedState) return cachedState;
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      cachedState = JSON.parse(content);
      return cachedState!;
    }
  } catch (err) {
    console.warn("Could not read db.json, using fresh state:", err);
  }
  cachedState = getInitialDatabase();
  saveState();
  return cachedState!;
}

function saveState() {
  if (!cachedState) return;
  try {
    ensureDirectoryExistence(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedState, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not write db.json:", err);
  }
}

/* =========================================================================
   PRISMA-STYLE QUERY CLIENT (Fluent API)
   ========================================================================= */

const jsonDb = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      const state = loadState();
      return (
        state.users.find((u) => (where.id && u.id === where.id) || (where.email && u.email.toLowerCase() === where.email.toLowerCase())) ||
        null
      );
    },
    findFirst: async ({ where }: { where?: Partial<DBUser> }) => {
      const state = loadState();
      if (!where) return state.users[0] || null;
      return (
        state.users.find((u) => {
          return Object.entries(where).every(([k, v]) => (u as any)[k] === v);
        }) || null
      );
    },
    create: async ({ data }: { data: Omit<DBUser, "id" | "createdAt" | "updatedAt"> & { id?: string } }) => {
      const state = loadState();
      const now = new Date().toISOString();
      const newUser: DBUser = {
        id: data.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || "USER",
        dailyGoalTarget: data.dailyGoalTarget || 20,
        createdAt: now,
        updatedAt: now,
      };
      state.users.push(newUser);
      saveState();
      return newUser;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<DBUser> }) => {
      const state = loadState();
      const index = state.users.findIndex((u) => u.id === where.id);
      if (index === -1) throw new Error("User not found");
      state.users[index] = {
        ...state.users[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveState();
      return state.users[index];
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const state = loadState();
      const index = state.users.findIndex((u) => u.id === where.id);
      if (index === -1) return null;
      const [deleted] = state.users.splice(index, 1);
      saveState();
      return deleted;
    },
  },

  vocabulary: {
    findMany: async (args?: {
      where?: {
        topic?: string;
        difficulty?: Difficulty;
        toeicParts?: { contains: string };
        OR?: Array<{ word?: { contains: string }; meaningVi?: { contains: string } }>;
        id?: { in?: string[]; notIn?: string[] };
      };
      orderBy?: { word?: "asc" | "desc"; createdAt?: "asc" | "desc" };
      take?: number;
      skip?: number;
    }) => {
      const state = loadState();
      let list = [...state.vocabularies];

      if (args?.where) {
        const { topic, difficulty, toeicParts, OR, id } = args.where;
        if (topic) {
          list = list.filter((v) => v.topic.toLowerCase() === topic.toLowerCase());
        }
        if (difficulty) {
          list = list.filter((v) => v.difficulty === difficulty);
        }
        if (toeicParts?.contains) {
          list = list.filter((v) => v.toeicParts.includes(toeicParts.contains));
        }
        if (id?.in) {
          const set = new Set(id.in);
          list = list.filter((v) => set.has(v.id));
        }
        if (id?.notIn) {
          const set = new Set(id.notIn);
          list = list.filter((v) => !set.has(v.id));
        }
        if (OR && OR.length > 0) {
          list = list.filter((v) => {
            return OR.some((condition) => {
              if (condition.word?.contains) {
                return v.word.toLowerCase().includes(condition.word.contains.toLowerCase());
              }
              if (condition.meaningVi?.contains) {
                return v.meaningVi.toLowerCase().includes(condition.meaningVi.contains.toLowerCase());
              }
              return false;
            });
          });
        }
      }

      if (args?.orderBy?.word) {
        list.sort((a, b) =>
          args.orderBy!.word === "asc" ? a.word.localeCompare(b.word) : b.word.localeCompare(a.word)
        );
      } else if (args?.orderBy?.createdAt) {
        list.sort((a, b) =>
          args.orderBy!.createdAt === "asc"
            ? a.createdAt.localeCompare(b.createdAt)
            : b.createdAt.localeCompare(a.createdAt)
        );
      }

      const skip = args?.skip || 0;
      const take = args?.take !== undefined ? args.take : list.length;
      return list.slice(skip, skip + take);
    },

    findUnique: async ({ where }: { where: { id?: string; word?: string } }) => {
      const state = loadState();
      return (
        state.vocabularies.find(
          (v) => (where.id && v.id === where.id) || (where.word && v.word.toLowerCase() === where.word.toLowerCase())
        ) || null
      );
    },

    count: async (args?: { where?: { topic?: string; difficulty?: Difficulty } }) => {
      const state = loadState();
      let list = state.vocabularies;
      if (args?.where?.topic) {
        list = list.filter((v) => v.topic.toLowerCase() === args.where!.topic!.toLowerCase());
      }
      if (args?.where?.difficulty) {
        list = list.filter((v) => v.difficulty === args.where!.difficulty);
      }
      return list.length;
    },

    create: async ({ data }: { data: Omit<DBVocabulary, "id" | "createdAt" | "updatedAt"> & { id?: string } }) => {
      const state = loadState();
      const now = new Date().toISOString();
      const newItem: DBVocabulary = {
        id: data.id || `voc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        word: data.word.trim(),
        partOfSpeech: data.partOfSpeech.trim(),
        meaningVi: data.meaningVi.trim(),
        meaningEn: data.meaningEn || null,
        pronunciation: data.pronunciation.trim(),
        audioUrl: data.audioUrl || null,
        exampleSentence: data.exampleSentence.trim(),
        exampleTranslation: data.exampleTranslation.trim(),
        difficulty: data.difficulty || "INTERMEDIATE",
        topic: data.topic.trim(),
        toeicParts: data.toeicParts.trim(),
        synonyms: data.synonyms || null,
        antonyms: data.antonyms || null,
        collocations: data.collocations || null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      };
      state.vocabularies.push(newItem);
      saveState();
      return newItem;
    },

    update: async ({ where, data }: { where: { id: string }; data: Partial<DBVocabulary> }) => {
      const state = loadState();
      const index = state.vocabularies.findIndex((v) => v.id === where.id);
      if (index === -1) throw new Error("Vocabulary word not found");
      state.vocabularies[index] = {
        ...state.vocabularies[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveState();
      return state.vocabularies[index];
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const state = loadState();
      const index = state.vocabularies.findIndex((v) => v.id === where.id);
      if (index === -1) throw new Error("Vocabulary word not found");
      const [removed] = state.vocabularies.splice(index, 1);
      // Clean up orphaned userVocabularies & bookmarks
      state.userVocabularies = state.userVocabularies.filter((uv) => uv.wordId !== where.id);
      state.bookmarks = state.bookmarks.filter((bm) => bm.wordId !== where.id);
      saveState();
      return removed;
    },
  },

  userVocabulary: {
    findUnique: async ({
      where,
      include,
    }: {
      where: { userId_wordId: { userId: string; wordId: string } };
      include?: { vocabulary?: boolean };
    }) => {
      const state = loadState();
      const item = state.userVocabularies.find(
        (uv) => uv.userId === where.userId_wordId.userId && uv.wordId === where.userId_wordId.wordId
      );
      if (!item) return null;
      if (include?.vocabulary) {
        const vocab = state.vocabularies.find((v) => v.id === item.wordId);
        return { ...item, vocabulary: vocab || null };
      }
      return item;
    },

    findMany: async (args?: {
      where?: {
        userId: string;
        status?: VocabStatus | { in?: VocabStatus[] };
        nextReviewAt?: { lte?: string };
        wrongCount?: { gt?: number };
      };
      include?: { vocabulary?: boolean };
      orderBy?: { nextReviewAt?: "asc" | "desc"; wrongCount?: "asc" | "desc"; updatedAt?: "desc" };
      take?: number;
    }): Promise<Array<DBUserVocabulary & { vocabulary?: DBVocabulary | null }>> => {
      const state = loadState();
      let list = state.userVocabularies.filter((uv) => !args?.where?.userId || uv.userId === args.where.userId);

      if (args?.where?.status) {
        if (typeof args.where.status === "string") {
          list = list.filter((uv) => uv.status === args!.where!.status);
        } else if (args.where.status.in) {
          const set = new Set(args.where.status.in);
          list = list.filter((uv) => set.has(uv.status));
        }
      }

      if (args?.where?.nextReviewAt?.lte) {
        const threshold = new Date(args.where.nextReviewAt.lte).getTime();
        list = list.filter((uv) => uv.nextReviewAt && new Date(uv.nextReviewAt).getTime() <= threshold);
      }

      if (args?.where?.wrongCount?.gt !== undefined) {
        list = list.filter((uv) => uv.wrongCount > args!.where!.wrongCount!.gt!);
      }

      if (args?.orderBy?.nextReviewAt) {
        list.sort((a, b) => {
          const timeA = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
          const timeB = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
          return args.orderBy!.nextReviewAt === "asc" ? timeA - timeB : timeB - timeA;
        });
      } else if (args?.orderBy?.wrongCount) {
        list.sort((a, b) =>
          args.orderBy!.wrongCount === "desc" ? b.wrongCount - a.wrongCount : a.wrongCount - b.wrongCount
        );
      }

      if (args?.take !== undefined) {
        list = list.slice(0, args.take);
      }

      if (args?.include?.vocabulary) {
        return list.map((item) => ({
          ...item,
          vocabulary: state.vocabularies.find((v) => v.id === item.wordId) || null,
        }));
      }

      return list;
    },

    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { userId_wordId: { userId: string; wordId: string } };
      create: {
        userId: string;
        wordId: string;
        status?: VocabStatus;
        easeFactor?: number;
        interval?: number;
        repetitions?: number;
        nextReviewAt?: string | null;
        lastReviewedAt?: string | null;
        correctCount?: number;
        wrongCount?: number;
      };
      update: Partial<DBUserVocabulary>;
    }) => {
      const state = loadState();
      const existingIndex = state.userVocabularies.findIndex(
        (uv) => uv.userId === where.userId_wordId.userId && uv.wordId === where.userId_wordId.wordId
      );
      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        state.userVocabularies[existingIndex] = {
          ...state.userVocabularies[existingIndex],
          ...update,
          updatedAt: now,
        };
        saveState();
        return state.userVocabularies[existingIndex];
      } else {
        const newItem: DBUserVocabulary = {
          id: `uv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: where.userId_wordId.userId,
          wordId: where.userId_wordId.wordId,
          status: create.status || "NEW",
          easeFactor: create.easeFactor !== undefined ? create.easeFactor : 2.5,
          interval: create.interval || 0,
          repetitions: create.repetitions || 0,
          nextReviewAt: create.nextReviewAt || null,
          lastReviewedAt: create.lastReviewedAt || null,
          correctCount: create.correctCount || 0,
          wrongCount: create.wrongCount || 0,
          createdAt: now,
          updatedAt: now,
        };
        state.userVocabularies.push(newItem);
        saveState();
        return newItem;
      }
    },

    count: async ({ where }: { where: { userId: string; status?: VocabStatus } }) => {
      const state = loadState();
      let list = state.userVocabularies.filter((uv) => uv.userId === where.userId);
      if (where.status) {
        list = list.filter((uv) => uv.status === where.status);
      }
      return list.length;
    },
  },

  bookmark: {
    findUnique: async ({
      where,
    }: {
      where: { userId_wordId: { userId: string; wordId: string } };
    }) => {
      const state = loadState();
      return (
        state.bookmarks.find(
          (bm) => bm.userId === where.userId_wordId.userId && bm.wordId === where.userId_wordId.wordId
        ) || null
      );
    },

    findMany: async ({
      where,
      include,
    }: {
      where: { userId: string };
      include?: { vocabulary?: boolean };
    }): Promise<Array<DBBookmark & { vocabulary?: DBVocabulary | null }>> => {
      const state = loadState();
      const list = state.bookmarks.filter((bm) => bm.userId === where.userId);
      if (include?.vocabulary) {
        return list.map((bm) => ({
          ...bm,
          vocabulary: state.vocabularies.find((v) => v.id === bm.wordId) || null,
        }));
      }
      return list;
    },

    create: async ({ data }: { data: { userId: string; wordId: string } }) => {
      const state = loadState();
      const existing = state.bookmarks.find((b) => b.userId === data.userId && b.wordId === data.wordId);
      if (existing) return existing;
      const newBm: DBBookmark = {
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: data.userId,
        wordId: data.wordId,
        createdAt: new Date().toISOString(),
      };
      state.bookmarks.push(newBm);
      saveState();
      return newBm;
    },

    delete: async ({
      where,
    }: {
      where: { userId_wordId: { userId: string; wordId: string } };
    }) => {
      const state = loadState();
      const index = state.bookmarks.findIndex(
        (b) => b.userId === where.userId_wordId.userId && b.wordId === where.userId_wordId.wordId
      );
      if (index === -1) return null;
      const [removed] = state.bookmarks.splice(index, 1);
      saveState();
      return removed;
    },
  },

  quizResult: {
    create: async ({
      data,
    }: {
      data: {
        userId: string;
        score: number;
        totalQuestions: number;
        correctCount: number;
        wrongCount: number;
        topic?: string | null;
        questions?: {
          create: Array<{
            wordId?: string | null;
            questionText: string;
            optionsJson: string;
            correctIndex: number;
            selectedIndex: number;
            isCorrect: boolean;
            explanation?: string | null;
          }>;
        };
      };
    }) => {
      const state = loadState();
      const now = new Date().toISOString();
      const quizId = `qz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newQuiz: DBQuizResult = {
        id: quizId,
        userId: data.userId,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctCount: data.correctCount,
        wrongCount: data.wrongCount,
        topic: data.topic || null,
        completedAt: now,
      };
      state.quizResults.push(newQuiz);

      if (data.questions?.create) {
        for (const q of data.questions.create) {
          const qItem: DBQuizQuestion = {
            id: `qq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            quizResultId: quizId,
            wordId: q.wordId || null,
            questionText: q.questionText,
            optionsJson: q.optionsJson,
            correctIndex: q.correctIndex,
            selectedIndex: q.selectedIndex,
            isCorrect: q.isCorrect,
            explanation: q.explanation || null,
          };
          state.quizQuestions.push(qItem);
        }
      }

      saveState();
      return newQuiz;
    },

    findMany: async ({
      where,
      orderBy,
      take,
    }: {
      where: { userId: string };
      orderBy?: { completedAt?: "asc" | "desc" };
      take?: number;
    }) => {
      const state = loadState();
      let list = state.quizResults.filter((qr) => qr.userId === where.userId);
      if (orderBy?.completedAt) {
        list.sort((a, b) =>
          orderBy.completedAt === "asc"
            ? a.completedAt.localeCompare(b.completedAt)
            : b.completedAt.localeCompare(a.completedAt)
        );
      }
      if (take) {
        list = list.slice(0, take);
      }
      return list;
    },
  },

  dailyGoal: {
    findUnique: async ({ where }: { where: { userId_date: { userId: string; date: string } } }) => {
      const state = loadState();
      return (
        state.dailyGoals.find(
          (dg) => dg.userId === where.userId_date.userId && dg.date === where.userId_date.date
        ) || null
      );
    },

    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { userId_date: { userId: string; date: string } };
      create: { userId: string; date: string; targetWords: number; learnedWords: number; completed: boolean };
      update: { targetWords?: number; learnedWords?: number; completed?: boolean };
    }) => {
      const state = loadState();
      const index = state.dailyGoals.findIndex(
        (dg) => dg.userId === where.userId_date.userId && dg.date === where.userId_date.date
      );
      const now = new Date().toISOString();

      if (index >= 0) {
        state.dailyGoals[index] = {
          ...state.dailyGoals[index],
          ...update,
          updatedAt: now,
        };
        saveState();
        return state.dailyGoals[index];
      } else {
        const newGoal: DBDailyGoal = {
          id: `dg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: where.userId_date.userId,
          date: where.userId_date.date,
          targetWords: create.targetWords || 20,
          learnedWords: create.learnedWords || 0,
          completed: create.completed || false,
          updatedAt: now,
        };
        state.dailyGoals.push(newGoal);
        saveState();
        return newGoal;
      }
    },
  },

  studyLog: {
    findMany: async ({
      where,
      orderBy,
    }: {
      where: { userId: string };
      orderBy?: { date?: "asc" | "desc" };
    }) => {
      const state = loadState();
      const list = state.studyLogs.filter((sl) => sl.userId === where.userId);
      if (orderBy?.date) {
        list.sort((a, b) =>
          orderBy.date === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
        );
      }
      return list;
    },

    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { userId_date: { userId: string; date: string } };
      create: { userId: string; date: string; wordsCount: number };
      update: { wordsCount: { increment: number } };
    }) => {
      const state = loadState();
      const index = state.studyLogs.findIndex(
        (sl) => sl.userId === where.userId_date.userId && sl.date === where.userId_date.date
      );
      const now = new Date().toISOString();

      if (index >= 0) {
        state.studyLogs[index].wordsCount += update.wordsCount.increment;
        saveState();
        return state.studyLogs[index];
      } else {
        const newLog: DBStudyLog = {
          id: `sl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: where.userId_date.userId,
          date: where.userId_date.date,
          wordsCount: create.wordsCount || 1,
          createdAt: now,
        };
        state.studyLogs.push(newLog);
        saveState();
        return newLog;
      }
    },
  },
};

/* =========================================================================
   HYBRID DATABASE ROUTER:
   - When DATABASE_URL is set (e.g. on Vercel with Neon/Supabase), routes to PostgreSQL via PrismaClient.
   - When DATABASE_URL is not set (e.g. local offline dev), routes to local persistent JSON engine.
   ========================================================================= */

const isPostgres = Boolean(
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("postgres") &&
  (!process.env.DATABASE_URL.includes("localhost") || process.env.USE_LOCAL_POSTGRES === "true")
);

let prismaInstance: any = null;
if (isPostgres) {
  try {
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
  } catch (err) {
    console.error("Could not initialize PrismaClient, falling back to local JSON store:", err);
  }
}

export const db: typeof jsonDb = (isPostgres && prismaInstance) ? (prismaInstance as unknown as typeof jsonDb) : jsonDb;
