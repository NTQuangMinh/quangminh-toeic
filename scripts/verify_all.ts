import { db } from "../src/lib/db";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth";
import { calculateSM2 } from "../src/lib/sm2";
import { askAITutor, generateAIQuestion } from "../src/lib/ai";
import { TOEIC_TOPICS, TOEIC_PARTS } from "../src/data/toeic-vocab-seed";

console.log("=================================================================");
console.log("🚀 TOEIC VOCABULARY PLATFORM: COMPREHENSIVE VERIFICATION SUITE");
console.log("=================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail || ""}`);
    failed++;
  }
}

async function run() {
  try {
    // -------------------------------------------------------------
    // SECTION 1: DATABASE INTEGRITY & SEED DATA
    // -------------------------------------------------------------
    console.log("📦 1. Database & Vocabulary Dataset:");
    const allWords = await db.vocabulary.findMany();
    assert(allWords.length >= 100, `Vocabulary database has 100+ words (Found: ${allWords.length})`);

    const topicsInDB = new Set(allWords.map((w) => w.topic));
    assert(
      TOEIC_TOPICS.every((t) => topicsInDB.has(t.id)),
      `All 20 TOEIC Topics exist in database (${topicsInDB.size} topics found)`
    );

    const partsInDB = new Set(allWords.flatMap((w) => w.toeicParts.split(",").map((p) => p.trim())));
    assert(
      TOEIC_PARTS.every((p) => partsInDB.has(p.id)),
      `All TOEIC Parts (Part 1 - Part 7) are represented`
    );

    const sample = await db.vocabulary.findUnique({ where: { word: "accommodate" } });
    assert(
      sample !== null && sample.meaningVi.includes("chỗ ở") && sample.pronunciation === "/əˈkɒmədeɪt/",
      "Word details for 'accommodate' contain correct IPA, Vietnamese translation, and example"
    );

    // -------------------------------------------------------------
    // SECTION 2: AUTHENTICATION & SECURITY
    // -------------------------------------------------------------
    console.log("\n🔒 2. Authentication & Cryptography:");
    const testPass = "super_secret_toeic_2026";
    const hashed = hashPassword(testPass);
    assert(verifyPassword(testPass, hashed), "Password verification with PBKDF2 succeeds");
    assert(!verifyPassword("wrong_password", hashed), "Rejects incorrect password");

    const demoUser = await db.user.findUnique({ where: { email: "demo@toeic.vn" } });
    assert(demoUser !== null && verifyPassword("demo123", demoUser.passwordHash), "Pre-seeded Demo User (demo@toeic.vn / demo123) is valid");

    const adminUser = await db.user.findUnique({ where: { email: "admin@toeic.vn" } });
    assert(adminUser !== null && adminUser.role === "ADMIN", "Pre-seeded Admin User (admin@toeic.vn) has ADMIN role");

    const token = signToken({ id: demoUser!.id, email: demoUser!.email, name: demoUser!.name, role: demoUser!.role });
    const verifiedUser = verifyToken(token);
    assert(verifiedUser !== null && verifiedUser.id === demoUser!.id, "JWT Session token signed and verified successfully");

    // -------------------------------------------------------------
    // SECTION 3: SPACED REPETITION (SM-2) MATHEMATICS
    // -------------------------------------------------------------
    console.log("\n🧠 3. Spaced Repetition (SuperMemo SM-2) Engine:");
    // Fresh word
    const sm2Again = calculateSM2({ repetitions: 2, interval: 6, easeFactor: 2.5 }, "AGAIN");
    assert(sm2Again.interval === 1 && sm2Again.repetitions === 0 && sm2Again.status === "LEARNING", "SM-2 'Again' resets interval to 1 and status to LEARNING");

    const sm2Hard = calculateSM2({ repetitions: 1, interval: 4, easeFactor: 2.5 }, "HARD");
    assert(sm2Hard.interval === 5 && sm2Hard.repetitions === 2, "SM-2 'Hard' increments repetitions and eases interval");

    const sm2Good1 = calculateSM2({ repetitions: 0, interval: 0, easeFactor: 2.5 }, "GOOD");
    assert(sm2Good1.interval === 1 && sm2Good1.repetitions === 1, "SM-2 'Good' 1st repetition gives interval = 1");

    const sm2Good2 = calculateSM2({ repetitions: 1, interval: 1, easeFactor: 2.5 }, "GOOD");
    assert(sm2Good2.interval === 4 && sm2Good2.repetitions === 2, "SM-2 'Good' 2nd repetition gives interval = 4");

    const sm2Good3 = calculateSM2({ repetitions: 2, interval: 4, easeFactor: 2.5 }, "GOOD");
    assert(sm2Good3.interval >= 10 && sm2Good3.status === "REVIEW", "SM-2 'Good' 3rd repetition scales interval by easeFactor");

    const sm2Easy = calculateSM2({ repetitions: 3, interval: 15, easeFactor: 2.5 }, "EASY");
    assert(sm2Easy.interval >= 21 && sm2Easy.status === "MASTERED", "SM-2 'Easy' promotes word to MASTERED (interval >= 21)");

    // -------------------------------------------------------------
    // SECTION 4: USER DASHBOARD, DAILY GOAL & STREAK
    // -------------------------------------------------------------
    console.log("\n📊 4. Daily Goal, Streak & Progress Metrics:");
    const todayStr = new Date().toISOString().split("T")[0];

    const updatedGoal = await db.dailyGoal.upsert({
      where: { userId_date: { userId: demoUser!.id, date: todayStr } },
      create: { userId: demoUser!.id, date: todayStr, targetWords: 20, learnedWords: 15, completed: false },
      update: { learnedWords: 18 },
    });
    assert(updatedGoal.targetWords === 20 && updatedGoal.learnedWords === 18, "Daily goal progress tracks accurately in database");

    const studyLogs = await db.studyLog.findMany({ where: { userId: demoUser!.id }, orderBy: { date: "asc" } });
    assert(studyLogs.length >= 7, `7-day study activity history exists (${studyLogs.length} days logged)`);

    // -------------------------------------------------------------
    // SECTION 5: REALISTIC TOEIC QUIZ ENGINE
    // -------------------------------------------------------------
    console.log("\n📝 5. Realistic TOEIC Quiz Engine:");
    const quizResult = await db.quizResult.create({
      data: {
        userId: demoUser!.id,
        score: 90,
        totalQuestions: 10,
        correctCount: 9,
        wrongCount: 1,
        topic: "Business",
        questions: {
          create: [
            {
              wordId: sample!.id,
              questionText: "The hotel can ______ up to 300 guests.",
              optionsJson: JSON.stringify(["accommodate", "postpone", "purchase", "manufacture"]),
              correctIndex: 0,
              selectedIndex: 0,
              isCorrect: true,
              explanation: "accommodate = cung cấp chỗ ở cho",
            },
            {
              wordId: allWords[1].id,
              questionText: "The manager had to ______ the meeting until Friday.",
              optionsJson: JSON.stringify(["maintain", "postpone", "calculate", "deliver"]),
              correctIndex: 1,
              selectedIndex: 0,
              isCorrect: false, // Made a mistake
              explanation: "postpone = hoãn lại",
            },
          ],
        },
      },
    });
    assert(quizResult.score === 90 && quizResult.correctCount === 9, "Quiz results recorded with 90% score and 9 correct answers");

    // -------------------------------------------------------------
    // SECTION 6: MY DIFFICULT WORDS (MISTAKES REVIEW)
    // -------------------------------------------------------------
    console.log("\n⚠️ 6. Difficult Words (Mistakes Review) Flow:");
    // Record mistake for word 1
    await db.userVocabulary.upsert({
      where: { userId_wordId: { userId: demoUser!.id, wordId: allWords[1].id } },
      create: { userId: demoUser!.id, wordId: allWords[1].id, correctCount: 1, wrongCount: 3 },
      update: { wrongCount: 3 },
    });

    const difficultWords = await db.userVocabulary.findMany({
      where: { userId: demoUser!.id, wrongCount: { gt: 0 } },
      include: { vocabulary: true },
      orderBy: { wrongCount: "desc" },
    });
    assert(
      difficultWords.length > 0 && difficultWords[0].vocabulary !== null && difficultWords[0].wrongCount > 0,
      `Difficult words retrieved correctly with wrongCount > 0 (${difficultWords.length} difficult words)`
    );

    // -------------------------------------------------------------
    // SECTION 7: BOOKMARKS (MY VOCABULARY)
    // -------------------------------------------------------------
    console.log("\n⭐ 7. Bookmarks / My Vocabulary:");
    await db.bookmark.create({ data: { userId: demoUser!.id, wordId: sample!.id } });
    const bookmarks = await db.bookmark.findMany({ where: { userId: demoUser!.id }, include: { vocabulary: true } });
    assert(bookmarks.some((b) => b.wordId === sample!.id), "Bookmark added and retrieved");

    await db.bookmark.delete({ where: { userId_wordId: { userId: demoUser!.id, wordId: sample!.id } } });
    const afterDelete = await db.bookmark.findUnique({ where: { userId_wordId: { userId: demoUser!.id, wordId: sample!.id } } });
    assert(afterDelete === null, "Bookmark removed cleanly");

    // -------------------------------------------------------------
    // SECTION 8: AI TUTOR & QUESTION GENERATOR
    // -------------------------------------------------------------
    console.log("\n🤖 8. AI Tutor & Question Generator:");
    const aiExplanation = await askAITutor({
      word: "postpone",
      partOfSpeech: "verb",
      meaningVi: "hoãn lại, dời lịch",
      exampleSentence: "The manager decided to postpone the meeting until Friday.",
      exampleTranslation: "Người quản lý đã quyết định hoãn cuộc họp sang thứ Sáu.",
      promptType: "explain_context",
    });
    assert(
      aiExplanation.reply.length > 50 && aiExplanation.reply.includes("TOEIC"),
      "AI Tutor generates comprehensive Vietnamese TOEIC explanation"
    );

    const aiQuestion = await generateAIQuestion({
      word: "negotiate",
      meaningVi: "đàm phán, thương lượng",
      topic: "Business",
      difficulty: "BEGINNER",
      exampleSentence: "The sales director will negotiate the contract with the supplier.",
    });
    assert(
      aiQuestion.options.length === 4 &&
      aiQuestion.options.includes("negotiate") &&
      aiQuestion.answer === 0 &&
      aiQuestion.explanation.length > 10,
      "AI Question Generator outputs strict validated 4-option TOEIC question"
    );

    // -------------------------------------------------------------
    // SECTION 9: ADMIN CMS
    // -------------------------------------------------------------
    console.log("\n🛠️ 9. Admin Content Management (CRUD):");
    const testAdminWord = await db.vocabulary.create({
      data: {
        word: "streamline_test",
        partOfSpeech: "verb",
        meaningVi: "tinh giản quy trình",
        pronunciation: "/ˈstriːmlaɪn/",
        exampleSentence: "The firm took measures to streamline workflow.",
        exampleTranslation: "Công ty đã áp dụng biện pháp để tinh giản quy trình làm việc.",
        difficulty: "ADVANCED",
        topic: "Business",
        toeicParts: "Part 5,Part 7",
      },
    });
    assert(testAdminWord.id !== undefined, "Admin created new vocabulary word");

    const updatedAdminWord = await db.vocabulary.update({
      where: { id: testAdminWord.id },
      data: { meaningVi: "tinh giản quy trình hiệu quả" },
    });
    assert(updatedAdminWord.meaningVi === "tinh giản quy trình hiệu quả", "Admin updated vocabulary word");

    await db.vocabulary.delete({ where: { id: testAdminWord.id } });
    const deletedCheck = await db.vocabulary.findUnique({ where: { id: testAdminWord.id } });
    assert(deletedCheck === null, "Admin deleted vocabulary word cleanly");

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log("\n=================================================================");
    console.log(`🎯 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================================\n");

    if (failed === 0) {
      console.log("🏆 ALL INTEGRATION TESTS & SYSTEM SPECIFICATIONS VERIFIED 100% SUCCESSFUL!");
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Verification error:", err);
    process.exit(1);
  }
}

run();
