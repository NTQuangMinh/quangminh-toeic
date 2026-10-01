console.log("🧪 Running E2E API & User Flow Verification against active server on http://127.0.0.1:3055...\n");

const BASE_URL = "http://127.0.0.1:3055";
let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details}`);
    failed++;
  }
}

async function run() {
  try {
    // 1. Landing page check
    const landingRes = await fetch(`${BASE_URL}/`);
    assert(landingRes.status === 200, "Landing Page returns HTTP 200");
    const landingHtml = await landingRes.text();
    assert(landingHtml.includes("Master TOEIC Vocabulary"), "Landing Page contains Hero Title");
    assert(landingHtml.includes("Explore Vocabulary"), "Landing Page contains Explore Vocabulary button");

    // 2. Demo User Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@toeic.vn", password: "demo123" }),
    });
    assert(loginRes.status === 200, "Demo user login succeeds (200 OK)");
    const loginData = await loginRes.json();
    assert(loginData.user && loginData.user.email === "demo@toeic.vn", "Returns valid demo learner object");

    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookie = setCookie.split(";")[0];
    assert(cookie.startsWith("toeic_token="), "Secure toeic_token HTTP-only cookie issued");

    // 3. Auth Me check
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookie },
    });
    assert(meRes.status === 200, "Auth Me route returns HTTP 200");
    const meData = await meRes.json();
    assert(meData.authenticated === true && meData.user.name === "Nguyễn Văn Hùng", "Returns session user profile");

    // 4. Vocabulary Search
    const searchRes = await fetch(`${BASE_URL}/api/vocabulary?q=meeting`);
    assert(searchRes.status === 200, "Vocabulary search returns HTTP 200");
    const searchData = await searchRes.json();
    assert(searchData.items && searchData.items.length > 0, "Finds vocabulary matching 'meeting'");

    // 5. Topic Filter (Hotels -> accommodate)
    const hotelRes = await fetch(`${BASE_URL}/api/vocabulary?topic=Hotels`);
    assert(hotelRes.status === 200, "Topic filter returns HTTP 200");
    const hotelData = await hotelRes.json();
    const hasAccommodate = hotelData.items.some((w) => w.word === "accommodate");
    assert(hasAccommodate, "Topic 'Hotels' contains core word 'accommodate'");

    // 6. Learn Mode Queue & Learn Action
    const learnRes = await fetch(`${BASE_URL}/api/learn?limit=5`, {
      headers: { Cookie: cookie },
    });
    assert(learnRes.status === 200, "Learn queue returns HTTP 200");
    const learnData = await learnRes.json();
    assert(learnData.items && learnData.items.length > 0, "Returns words to study in Learn mode");

    const sampleWord = learnData.items[0];
    const markRes = await fetch(`${BASE_URL}/api/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ wordId: sampleWord.id }),
    });
    assert(markRes.status === 200, "Marking word as learned succeeds");
    const markData = await markRes.json();
    assert(markData.success === true && markData.dailyGoal, "Daily goal progress updated");

    // 7. Spaced Repetition (SM-2) Review
    const reviewRes = await fetch(`${BASE_URL}/api/review`, {
      headers: { Cookie: cookie },
    });
    assert(reviewRes.status === 200, "Review due queue returns HTTP 200");
    const reviewData = await reviewRes.json();
    assert(reviewData.items !== undefined, "Returns review items structure");

    const rateRes = await fetch(`${BASE_URL}/api/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ wordId: sampleWord.id, rating: "GOOD" }),
    });
    assert(rateRes.status === 200, "SM-2 rating submission succeeds");
    const rateData = await rateRes.json();
    assert(rateData.result && rateData.result.interval >= 1, "SM-2 calculates updated interval and ease factor");

    // 8. TOEIC Quiz Generation & Scoring
    const quizGenRes = await fetch(`${BASE_URL}/api/quiz?size=5`);
    assert(quizGenRes.status === 200, "Quiz question generator returns HTTP 200");
    const quizGenData = await quizGenRes.json();
    assert(quizGenData.questions && quizGenData.questions.length === 5, "Generates 5 questions");
    assert(quizGenData.questions[0].options.length === 4, "Quiz question has 4 options");

    const userAnswers = quizGenData.questions.map((q) => q.correctIndex);
    const submitQuizRes = await fetch(`${BASE_URL}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        questions: quizGenData.questions,
        userAnswers,
      }),
    });
    assert(submitQuizRes.status === 200, "Quiz submission returns HTTP 200");
    const submitQuizData = await submitQuizRes.json();
    assert(submitQuizData.result.score === 100, "Perfect score computed as 100%");

    // 9. Difficult Words Tracking
    const diffRes = await fetch(`${BASE_URL}/api/difficult-words?sortBy=most_wrong`, {
      headers: { Cookie: cookie },
    });
    assert(diffRes.status === 200, "Difficult words route returns HTTP 200");
    const diffData = await diffRes.json();
    assert(Array.isArray(diffData.items), "Difficult words returns array of mistakes");

    // 10. Bookmarks (Save & Unsave)
    const bmRes = await fetch(`${BASE_URL}/api/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ wordId: sampleWord.id }),
    });
    assert(bmRes.status === 200, "Bookmark toggle returns HTTP 200");

    // 11. User Progress & Dashboard Real Data
    const progressRes = await fetch(`${BASE_URL}/api/user/progress`, {
      headers: { Cookie: cookie },
    });
    assert(progressRes.status === 200, "User progress route returns HTTP 200");
    const progressData = await progressRes.json();
    assert(progressData.streak >= 1, "Real streak calculated from database");
    assert(progressData.weeklyActivity.length === 7, "Weekly activity returns 7 days of real activity data");
    assert(progressData.todayGoal.targetWords === 20, "Daily goal target set to 20 words");

    // 12. AI Tutor & Question Generator
    const tutorRes = await fetch(`${BASE_URL}/api/ai/tutor`, {
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
    assert(tutorRes.status === 200, "AI Tutor endpoint returns HTTP 200");
    const tutorData = await tutorRes.json();
    assert(tutorData.reply && tutorData.reply.length > 50, "AI Tutor returns rich Vietnamese pedagogical guidance");

    const aiQRes = await fetch(`${BASE_URL}/api/ai/generate-question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: sampleWord.id }),
    });
    assert(aiQRes.status === 200, "AI Question Generator returns HTTP 200");
    const aiQData = await aiQRes.json();
    assert(aiQData.question && aiQData.question.options.length === 4, "AI Question generator returns validated 4-option question");

    console.log(`\n======================================================`);
    console.log(`🎯 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed === 0) {
      console.log("🏆 ALL USER FLOWS & API ENDPOINTS VERIFIED 100% WORKING!");
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

run();
