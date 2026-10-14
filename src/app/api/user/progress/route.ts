import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/auth";
import { getVietnamTodayDate } from "@/lib/study-tracker";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await getEffectiveUserId();

    const user = await db.user.findUnique({ where: { id: userId } });
    const targetWords = user?.dailyGoalTarget || 20;

    const todayStr = getVietnamTodayDate();
    const now = new Date().toISOString();


    // 1. Today's Goal
    const dailyGoal = await db.dailyGoal.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });
    const learnedWordsToday = dailyGoal?.learnedWords || 0;
    const goalPercentage = Math.min(100, Math.round((learnedWordsToday / targetWords) * 100));

    // 2. User Vocabulary Stats
    const userVocabs = await db.userVocabulary.findMany({
      where: { userId },
    });

    const masteredCount = userVocabs.filter((uv) => uv.status === "MASTERED").length;
    const learningCount = userVocabs.filter((uv) => uv.status === "LEARNING" || uv.status === "REVIEW").length;
    const totalLearned = userVocabs.filter((uv) => uv.status !== "NEW").length;

    const totalInDB = await db.vocabulary.count();
    const newWordsCount = Math.max(0, totalInDB - totalLearned);

    // 3. Due for review
    const dueCount = userVocabs.filter(
      (uv) => uv.nextReviewAt && new Date(uv.nextReviewAt).getTime() <= new Date(now).getTime()
    ).length;

    // 4. Difficult words (wrongCount > 0 or accuracy < 60%)
    const difficultWords = userVocabs.filter((uv) => uv.wrongCount > 0);
    const difficultWordsCount = difficultWords.length;

    // 5. Quiz Stats
    const quizResults = await db.quizResult.findMany({
      where: { userId },
    });
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    for (const q of quizResults) {
      totalQuestionsAnswered += q.totalQuestions;
      totalCorrectAnswers += q.correctCount;
    }
    const quizAccuracy =
      totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;

    // 6. Real 7-day & 30-day Mistake Trends
    const nowMs = Date.now();
    const sevenDaysAgo = nowMs - 7 * 86400 * 1000;
    const fourteenDaysAgo = nowMs - 14 * 86400 * 1000;
    const thirtyDaysAgo = nowMs - 30 * 86400 * 1000;

    let mistakes7d = 0;
    let mistakesPrev7d = 0;
    let mistakes30d = 0;

    for (const qr of quizResults) {
      const qTime = new Date(qr.completedAt).getTime();
      if (qTime >= sevenDaysAgo) {
        mistakes7d += qr.wrongCount;
      } else if (qTime >= fourteenDaysAgo) {
        mistakesPrev7d += qr.wrongCount;
      }
      if (qTime >= thirtyDaysAgo) {
        mistakes30d += qr.wrongCount;
      }
    }

    userVocabs.forEach((uv) => {
      const revTime = uv.lastReviewedAt ? new Date(uv.lastReviewedAt).getTime() : new Date(uv.updatedAt).getTime();
      if (revTime >= sevenDaysAgo) {
        mistakes7d += uv.wrongCount;
      } else if (revTime >= fourteenDaysAgo) {
        mistakesPrev7d += uv.wrongCount;
      }
      if (revTime >= thirtyDaysAgo) {
        mistakes30d += uv.wrongCount;
      }
    });

    const diffMistakes = mistakes7d - mistakesPrev7d;
    const trendPercent = mistakesPrev7d > 0 ? Math.round((Math.abs(diffMistakes) / mistakesPrev7d) * 100) : 0;
    const trendDirection = diffMistakes < 0 ? "improving" : diffMistakes > 0 ? "worsening" : "stable";

    // 7. Streak calculation (strict consecutive active days)
    const studyLogs = await db.studyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    let currentStreak = 0;
    const todayLog = studyLogs.find((l) => l.date === todayStr && l.wordsCount > 0);
    let checkDate = new Date();

    // If studied today, count starts from today. If not yet today, check starting from yesterday.
    if (!todayLog) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split("T")[0];
      const log = studyLogs.find((l) => l.date === dStr && l.wordsCount > 0);
      if (log) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 8. Weekly Activity Chart (Last 7 days)
    const weeklyActivity: Array<{ date: string; dayLabel: string; count: number }> = [];
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    let wordsLearnedThisWeek = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const dayLabel = dayNames[d.getDay()];

      const found = studyLogs.find((l) => l.date === dStr);
      const count = found ? found.wordsCount : 0;
      wordsLearnedThisWeek += count;

      weeklyActivity.push({
        date: dStr,
        dayLabel,
        count,
      });
    }

    return NextResponse.json({
      user: {
        id: userId,
        name: user?.name || "Người học TOEIC",
        email: user?.email || "demo@toeic.vn",
        dailyGoalTarget: targetWords,
      },
      streak: currentStreak,
      todayGoal: {
        targetWords,
        learnedWords: learnedWordsToday,
        remainingWords: Math.max(0, targetWords - learnedWordsToday),
        percentage: goalPercentage,
        completed: learnedWordsToday >= targetWords,
      },
      counts: {
        newWordsToday: Math.min(5, newWordsCount),
        dueForReview: dueCount,
        practiceQuestions: 10,
        totalLearned,
        mastered: masteredCount,
        learning: learningCount,
        newWords: newWordsCount,
        difficultWordsCount,
      },
      stats: {
        quizAccuracy,
        totalQuestionsAnswered,
        totalCorrectAnswers,
        totalReviewSessions: userVocabs.filter((uv) => uv.repetitions > 0).length + quizResults.length,
        wordsLearnedThisWeek,
        masteredDefinition: "repetitions >= 3 && interval >= 21",
        mistakeTrends: {
          mistakes7d,
          mistakesPrev7d,
          mistakes30d,
          trendPercent,
          trendDirection,
        },
      },
      weeklyActivity,
    });
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ error: "Không thể tải số liệu tiến độ học tập." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getEffectiveUserId();
    const body = await req.json();
    const { dailyGoalTarget } = body;

    if (!dailyGoalTarget || typeof dailyGoalTarget !== "number") {
      return NextResponse.json({ error: "Mục tiêu số từ không hợp lệ." }, { status: 400 });
    }

    const clampedTarget = Math.min(100, Math.max(5, Math.round(dailyGoalTarget)));

    const updated = await db.user.update({
      where: { id: userId },
      data: { dailyGoalTarget: clampedTarget },
    });

    return NextResponse.json({
      success: true,
      dailyGoalTarget: updated.dailyGoalTarget,
    });
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật mục tiêu học tập." }, { status: 500 });
  }
}
