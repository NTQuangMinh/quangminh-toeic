import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEffectiveUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getEffectiveUserId();

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "most_wrong"; // most_wrong, lowest_accuracy, most_overdue

    const userVocabs = await db.userVocabulary.findMany({
      where: {
        userId,
        wrongCount: { gt: 0 },
      },
      include: { vocabulary: true },
    });

    const bookmarks = await db.bookmark.findMany({ where: { userId } });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.wordId));

    const items = userVocabs
      .filter((uv) => uv.vocabulary !== null)
      .map((uv) => {
        const total = uv.correctCount + uv.wrongCount;
        const accuracy = total > 0 ? Math.round((uv.correctCount / total) * 100) : 0;
        return {
          ...uv.vocabulary!,
          wrongCount: uv.wrongCount,
          correctCount: uv.correctCount,
          totalAttempts: total,
          accuracy,
          interval: uv.interval,
          nextReviewAt: uv.nextReviewAt,
          isBookmarked: bookmarkedIds.has(uv.wordId),
        };
      });


    if (sortBy === "lowest_accuracy") {
      items.sort((a, b) => a.accuracy - b.accuracy);
    } else if (sortBy === "most_overdue") {
      items.sort((a, b) => {
        const timeA = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0;
        const timeB = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0;
        return timeA - timeB;
      });
    } else {
      // most_wrong default
      items.sort((a, b) => b.wrongCount - a.wrongCount);
    }

    // Calculate 7-day and 30-day mistake trend metrics based on real timestamps
    const nowMs = Date.now();
    const sevenDaysAgo = nowMs - 7 * 86400 * 1000;
    const fourteenDaysAgo = nowMs - 14 * 86400 * 1000;
    const thirtyDaysAgo = nowMs - 30 * 86400 * 1000;

    const quizResults = await db.quizResult.findMany({ where: { userId } });
    let quizMistakes7d = 0;
    let quizMistakesPrev7d = 0;
    let quizMistakes30d = 0;

    for (const qr of quizResults) {
      const qTime = new Date(qr.completedAt).getTime();
      if (qTime >= sevenDaysAgo) {
        quizMistakes7d += qr.wrongCount;
      } else if (qTime >= fourteenDaysAgo) {
        quizMistakesPrev7d += qr.wrongCount;
      }
      if (qTime >= thirtyDaysAgo) {
        quizMistakes30d += qr.wrongCount;
      }
    }

    let reviewMistakes7d = 0;
    let reviewMistakesPrev7d = 0;
    let reviewMistakes30d = 0;

    userVocabs.forEach((uv) => {
      const revTime = uv.lastReviewedAt ? new Date(uv.lastReviewedAt).getTime() : new Date(uv.updatedAt).getTime();
      if (revTime >= sevenDaysAgo) {
        reviewMistakes7d += uv.wrongCount;
      } else if (revTime >= fourteenDaysAgo) {
        reviewMistakesPrev7d += uv.wrongCount;
      }
      if (revTime >= thirtyDaysAgo) {
        reviewMistakes30d += uv.wrongCount;
      }
    });

    const mistakes7d = quizMistakes7d + reviewMistakes7d;
    const mistakesPrev7d = quizMistakesPrev7d + reviewMistakesPrev7d;
    const mistakes30d = quizMistakes30d + reviewMistakes30d;
    const diff = mistakes7d - mistakesPrev7d;
    const trendPercent = mistakesPrev7d > 0 ? Math.round((Math.abs(diff) / mistakesPrev7d) * 100) : 0;
    const trendDirection = diff < 0 ? "improving" : diff > 0 ? "worsening" : "stable";

    return NextResponse.json({
      items,
      total: items.length,
      trends: {
        mistakes7d,
        mistakesPrev7d,
        mistakes30d,
        trendPercent,
        trendDirection,
      },
    });
  } catch (error) {
    console.error("Difficult words GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách từ hay sai." }, { status: 500 });
  }
}
