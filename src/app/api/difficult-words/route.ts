import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

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

    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("Difficult words GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách từ hay sai." }, { status: 500 });
  }
}
