import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { calculateSM2, SM2Rating } from "@/lib/sm2";
import { recordStudyActivity } from "@/lib/study-tracker";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "due"; // 'due' or 'all' (cram mode)
    const now = new Date().toISOString();

    const whereClause: any = { userId };
    if (mode === "due") {
      whereClause.nextReviewAt = { lte: now };
    } else {
      // 'all' mode: fetch all words user has interacted with
      whereClause.status = { not: "NEW" };
    }

    // Fetch user words
    const userVocabs = await db.userVocabulary.findMany({
      where: whereClause,
      include: { vocabulary: true },
      orderBy: { nextReviewAt: "asc" },
      take: 50,
    });

    // Also get user's bookmarks
    const bookmarks = await db.bookmark.findMany({ where: { userId } });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.wordId));

    const rawItems = userVocabs
      .filter((uv) => uv.vocabulary !== null)
      .map((uv) => ({
        ...uv.vocabulary!,
        userVocabId: uv.id,
        status: uv.status,
        interval: uv.interval,
        repetitions: uv.repetitions,
        easeFactor: uv.easeFactor,
        correctCount: uv.correctCount,
        wrongCount: uv.wrongCount,
        isBookmarked: bookmarkedIds.has(uv.wordId),
      }));

    // Shuffle review words using Fisher-Yates algorithm
    const items = [...rawItems];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    // Fetch vocabulary pool for generating realistic distractors
    const pool = await db.vocabulary.findMany({
      take: 80,
    });

    return NextResponse.json({
      items,
      countDue: items.length,
      mode,
      pool,
    });
  } catch (error) {
    console.error("Review GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách từ cần ôn tập." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const body = await req.json();
    const { wordId, rating } = body as { wordId: string; rating: SM2Rating };

    if (!wordId || !rating) {
      return NextResponse.json({ error: "Thiếu wordId hoặc rating." }, { status: 400 });
    }

    const currentUV = await db.userVocabulary.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    const currentSM2 = currentUV
      ? {
          repetitions: currentUV.repetitions,
          interval: currentUV.interval,
          easeFactor: currentUV.easeFactor,
        }
      : { repetitions: 0, interval: 0, easeFactor: 2.5 };

    const sm2Result = calculateSM2(currentSM2, rating);
    const now = new Date().toISOString();

    const updatedUV = await db.userVocabulary.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: {
        userId,
        wordId,
        status: sm2Result.status,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewAt: sm2Result.nextReviewAt.toISOString(),
        lastReviewedAt: now,
        correctCount: sm2Result.isCorrect ? 1 : 0,
        wrongCount: sm2Result.isCorrect ? 0 : 1,
      },
      update: {
        status: sm2Result.status,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewAt: sm2Result.nextReviewAt.toISOString(),
        lastReviewedAt: now,
        correctCount: (currentUV?.correctCount || 0) + (sm2Result.isCorrect ? 1 : 0),
        wrongCount: (currentUV?.wrongCount || 0) + (sm2Result.isCorrect ? 0 : 1),
      },
    });

    // Record study activity (DailyGoal + StudyLog) so review sessions count towards streaks
    await recordStudyActivity(userId, 1);

    return NextResponse.json({
      success: true,
      result: sm2Result,
      userVocab: updatedUV,
    });
  } catch (error) {
    console.error("Review POST error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật kết quả ôn tập." }, { status: 500 });
  }
}
