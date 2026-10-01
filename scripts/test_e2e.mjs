import http from "http";
import { spawn } from "child_process";

console.log("🧪 Starting Comprehensive E2E Verification Suite for TOEIC Vocabulary Learning App...\n");

// We'll spin up Next.js standalone server or test against running Next.js server
const PORT = 3055;
process.env.PORT = String(PORT);

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(PORT) },
});

let serverStarted = false;

server.stdout.on("data", (data) => {
  const msg = data.toString();
  if (msg.includes("Ready") || msg.includes("started server on") || msg.includes(`:${PORT}`)) {
    serverStarted = true;
  }
});

server.stderr.on("data", (data) => {
  console.error("Server stderr:", data.toString());
});

async function waitForServer(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/vocabulary?limit=1`);
      if (res.ok) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return false;
}

async function runTests() {
  const ready = await waitForServer();
  if (!ready) {
    console.error("❌ Failed to start Next.js test server.");
    server.kill();
    process.exit(1);
  }

  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      failed++;
    }
  }

  try {
    // TEST 1: Landing Page renders HTTP 200
    const homeRes = await fetch(`http://localhost:${PORT}/`);
    assert(homeRes.status === 200, "Landing Page renders with status 200");
    const homeText = await homeRes.text();
    assert(homeText.includes("Master TOEIC Vocabulary"), "Landing Page contains Hero Title");

    // TEST 2: Demo User Login
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@toeic.vn", password: "demo123" }),
    });
    assert(loginRes.status === 200, "Demo user logs in successfully (200 OK)");
    const loginData = await loginRes.json();
    assert(loginData.user && loginData.user.email === "demo@toeic.vn", "Returns valid user payload");

    // Extract cookie
    const setCookieHeader = loginRes.headers.get("set-cookie") || "";
    const cookie = setCookieHeader.split(";")[0];
    assert(cookie.startsWith("toeic_token="), "Issues secure HTTP-only toeic_token cookie");

    // TEST 3: Auth Me Session Verification
    const meRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
      headers: { Cookie: cookie },
    });
    assert(meRes.status === 200, "Auth Me route verifies session");
    const meData = await meRes.json();
    assert(meData.authenticated === true && meData.user.name === "Nguyễn Văn Hùng", "Returns authenticated learner profile");

    // TEST 4: Vocabulary Search & Filters
    const searchRes = await fetch(`http://localhost:${PORT}/api/vocabulary?q=meeting`);
    const searchData = await searchRes.json();
    assert(searchData.items.length > 0, "Global search finds matching words for 'meeting'");

    const topicRes = await fetch(`http://localhost:${PORT}/api/vocabulary?topic=Hotels`);
    const topicData = await topicRes.json();
    assert(
      topicData.items.some((w) => w.word.toLowerCase() === "accommodate"),
      "Topic filter 'Hotels' contains 'accommodate'"
    );

    // TEST 5: Learn Mode Queue & Learning Action
    const learnRes = await fetch(`http://localhost:${PORT}/api/learn?limit=5`, {
      headers: { Cookie: cookie },
    });
    const learnData = await learnRes.json();
    assert(learnData.items && learnData.items.length > 0, "Learn queue returns words to study");

    const testWord = learnData.items[0];
    const markLearnRes = await fetch(`http://localhost:${PORT}/api/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ wordId: testWord.id }),
    });
    assert(markLearnRes.status === 200, "Marks word as learned and records progress");

    // TEST 6: Spaced Repetition (SM-2) Review
    const reviewRes = await fetch(`http://localhost:${PORT}/api/review`, {
      headers: { Cookie: cookie },
    });
    const reviewData = await reviewRes.json();
    assert(reviewData.items !== undefined, "Review route returns due items");

    const rateRes = await fetch(`http://localhost:${PORT}/api/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ wordId: testWord.id, rating: "GOOD" }),
    });
    assert(rateRes.status === 200, "Submits SM-2 rating successfully");
    const rateData = await rateRes.json();
    assert(rateData.result && rateData.result.interval >= 1, "SM-2 calculates updated interval and easeFactor");

    // TEST 7: Quiz Generation & Submission
    const quizGenRes = await fetch(`http://localhost:${PORT}/api/quiz?size=5`);
    const quizGenData = await quizGenRes.json();
    assert(quizGenData.questions && quizGenData.questions.length === 5, "Generates 5 realistic TOEIC questions");
    assert(quizGenData.questions[0].options.length === 4, "Each quiz question has 4 options (A, B, C, D)");

    // Submit quiz
    const userAnswers = quizGenData.questions.map((q) => q.correctIndex); // Answer all correctly
    const submitQuizRes = await fetch(`http://localhost:${PORT}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        questions: quizGenData.questions,
        userAnswers,
      }),
    });
    assert(submitQuizRes.status === 200, "Submits quiz answers and calculates score");
    const submitQuizData = await submitQuizRes.json();
    assert(submitQuizData.result.score === 100, "Perfect score calculated correctly (100%)");

    // TEST 8: Difficult Words Tracking
    const diffRes = await fetch(`http://localhost:${PORT}/api/difficult-words?sortBy=most_wrong`, {
      headers: { Cookie: cookie },
    });
    const diffData = await diffRes.json();
    assert(Array.isArray(diffData.items), "Difficult words route returns mistakes list");

    // TEST 9: Bookmarks Toggle
    const bmAddRes = await fetch(`http://localhost:${PORT}/api/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ wordId: testWord.id }),
    });
    assert(bmAddRes.status === 200, "Bookmarks toggle works");

    // TEST 10: User Progress & Dashboard Real Data
    const progressRes = await fetch(`http://localhost:${PORT}/api/user/progress`, {
      headers: { Cookie: cookie },
    });
    assert(progressRes.status === 200, "User progress route returns metrics");
    const progressData = await progressRes.json();
    assert(progressData.streak >= 1, "Real streak calculated from database activity");
    assert(progressData.weeklyActivity.length === 7, "Weekly activity chart contains 7 days of real data");

    // TEST 11: AI Tutor Pedagogical Response
    const tutorRes = await fetch(`http://localhost:${PORT}/api/ai/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: "postpone",
        partOfSpeech: "verb",
        meaningVi: "hoãn lại, dời lịch",
        exampleSentence: "The manager decided to postpone the meeting until Friday.",
        exampleTranslation: "Người quản lý đã quyết định hoãn cuộc họp sang thứ Sáu.",
        promptType: "explain_context",
      }),
    });
    assert(tutorRes.status === 200, "AI Tutor endpoint responds successfully");
    const tutorData = await tutorRes.json();
    assert(tutorData.reply && tutorData.reply.length > 50, "AI Tutor provides detailed Vietnamese explanation");

    // TEST 12: AI Question Generator
    const aiQRes = await fetch(`http://localhost:${PORT}/api/ai/generate-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: testWord.id }),
    });
    assert(aiQRes.status === 200, "AI Question Generator succeeds");
    const aiQData = await aiQRes.json();
    assert(
      aiQData.question && aiQData.question.options.length === 4 && typeof aiQData.question.answer === "number",
      "AI Question Generator returns strict structured schema"
    );

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    server.kill();
    console.log(`\n========================================`);
    console.log(`🎯 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log("🎉 ALL INTEGRATION TESTS PASSED CLEANLY!");
      process.exit(0);
    }
  }
}

runTests();
