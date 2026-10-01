import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001"; // Fallback to demo user if unauthenticated preview

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || "";
    const toeicPart = searchParams.get("toeicPart") || "";
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    // Find words already in user's review or mastered list
    const userWords = await db.userVocabulary.findMany({
      where: { userId },
    });
    const learnedWordIds = new Set(userWords.map((uw) => uw.wordId));

    // Get user's bookmarks for quick indicator
    const bookmarks = await db.bookmark.findMany({
      where: { userId },
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.wordId));

    // Filter vocabulary
    const where: any = {};
    if (topic && topic !== "all") {
      where.topic = topic;
    }
    if (toeicPart && toeicPart !== "all") {
      where.toeicParts = { contains: toeicPart };
    }

    const allMatching = await db.vocabulary.findMany({ where });

    // Prioritize unlearned words first, then learning words
    const unlearnedWords = allMatching.filter((w) => !learnedWordIds.has(w.id));
    const learningWords = allMatching.filter((w) => {
      const uw = userWords.find((u) => u.wordId === w.id);
      return uw && uw.status === "LEARNING";
    });

    const wordsToLearn = [...unlearnedWords, ...learningWords].slice(0, limit);

    const items = wordsToLearn.map((w) => ({
      ...w,
      isBookmarked: bookmarkedIds.has(w.id),
      userStatus: userWords.find((u) => u.wordId === w.id)?.status || "NEW",
    }));

    return NextResponse.json({
      items,
      totalQueue: items.length,
    });
  } catch (error) {
    console.error("Learn GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách bài học." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const body = await req.json();
    const { wordId } = body;

    if (!wordId) {
      return NextResponse.json({ error: "Thiếu wordId." }, { status: 400 });
    }

    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const now = new Date().toISOString();
    const todayStr = now.split("T")[0];

    // Upsert into UserVocabulary
    const userVocab = await db.userVocabulary.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: {
        userId,
        wordId,
        status: "LEARNING",
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        nextReviewAt: tomorrow,
        lastReviewedAt: now,
        correctCount: 1,
        wrongCount: 0,
      },
      update: {
        lastReviewedAt: now,
        nextReviewAt: tomorrow,
        repetitions: 1,
        status: "LEARNING",
      },
    });

    // Update Daily Goal
    const user = await db.user.findUnique({ where: { id: userId } });
    const target = user?.dailyGoalTarget || 20;

    const currentGoal = await db.dailyGoal.findUnique({
      where: { userId_date: { userId, date: todayStr } },
    });

    const newLearned = (currentGoal?.learnedWords || 0) + 1;
    const isCompleted = newLearned >= target;

    const updatedGoal = await db.dailyGoal.upsert({
      where: { userId_date: { userId, date: todayStr } },
      create: {
        userId,
        date: todayStr,
        targetWords: target,
        learnedWords: 1,
        completed: 1 >= target,
      },
      update: {
        learnedWords: newLearned,
        completed: isCompleted,
      },
    });

    // Update StudyLog for activity chart
    await db.studyLog.upsert({
      where: { userId_date: { userId, date: todayStr } },
      create: {
        userId,
        date: todayStr,
        wordsCount: 1,
      },
      update: {
        wordsCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      userVocab,
      dailyGoal: updatedGoal,
      justCompletedGoal: isCompleted && !currentGoal?.completed,
    });
  } catch (error) {
    console.error("Learn POST error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu tiến độ học." }, { status: 500 });
  }
}
