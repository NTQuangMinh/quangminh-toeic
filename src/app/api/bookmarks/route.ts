import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    const userId = session?.id || "usr_demo_vietnam_001";

    const bookmarks = await db.bookmark.findMany({
      where: { userId },
      include: { vocabulary: true },
    });

    const items = bookmarks
      .filter((b) => b.vocabulary !== null)
      .map((b) => ({
        ...b.vocabulary!,
        bookmarkId: b.id,
        bookmarkedAt: b.createdAt,
        isBookmarked: true,
      }));


    return NextResponse.json({
      items,
      total: items.length,
    });
  } catch (error) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách từ đã lưu." }, { status: 500 });
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

    const existing = await db.bookmark.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    if (existing) {
      await db.bookmark.delete({
        where: { userId_wordId: { userId, wordId } },
      });
      return NextResponse.json({ success: true, isBookmarked: false });
    } else {
      await db.bookmark.create({
        data: { userId, wordId },
      });
      return NextResponse.json({ success: true, isBookmarked: true });
    }
  } catch (error) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu/bỏ lưu từ vựng." }, { status: 500 });
  }
}
