import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const topic = searchParams.get("topic") || "";
    const toeicPart = searchParams.get("toeicPart") || "";
    const difficulty = searchParams.get("difficulty") as any;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const where: any = {};
    if (topic && topic !== "all") {
      where.topic = topic;
    }
    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }
    if (toeicPart && toeicPart !== "all") {
      where.toeicParts = { contains: toeicPart };
    }
    if (q.trim()) {
      where.OR = [
        { word: { contains: q.trim() } },
        { meaningVi: { contains: q.trim() } },
      ];
    }

    const items = await db.vocabulary.findMany({
      where,
      orderBy: { word: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.vocabulary.count({ where });

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Vocabulary GET error:", error);
    return NextResponse.json({ error: "Không thể tải danh sách từ vựng." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bạn không có quyền quản trị viên." }, { status: 403 });
    }

    const body = await req.json();
    const {
      word,
      partOfSpeech,
      meaningVi,
      meaningEn,
      pronunciation,
      audioUrl,
      exampleSentence,
      exampleTranslation,
      difficulty,
      topic,
      toeicParts,
      synonyms,
      antonyms,
      collocations,
      notes,
    } = body;

    if (!word || !partOfSpeech || !meaningVi || !pronunciation || !exampleSentence || !exampleTranslation || !topic) {
      return NextResponse.json({ error: "Vui lòng điền các trường bắt buộc." }, { status: 400 });
    }

    const existing = await db.vocabulary.findUnique({
      where: { word: word.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: `Từ vựng "${word}" đã tồn tại trong cơ sở dữ liệu.` }, { status: 409 });
    }

    const newVocab = await db.vocabulary.create({
      data: {
        word: word.trim(),
        partOfSpeech: partOfSpeech.trim(),
        meaningVi: meaningVi.trim(),
        meaningEn: meaningEn || null,
        pronunciation: pronunciation.trim(),
        audioUrl: audioUrl || null,
        exampleSentence: exampleSentence.trim(),
        exampleTranslation: exampleTranslation.trim(),
        difficulty: difficulty || "INTERMEDIATE",
        topic: topic.trim(),
        toeicParts: toeicParts || "Part 5",
        synonyms: synonyms || null,
        antonyms: antonyms || null,
        collocations: collocations || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, item: newVocab }, { status: 201 });
  } catch (error) {
    console.error("Vocabulary POST error:", error);
    return NextResponse.json({ error: "Lỗi khi thêm từ vựng mới." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bạn không có quyền quản trị viên." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID từ vựng cần cập nhật." }, { status: 400 });
    }

    const updated = await db.vocabulary.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Vocabulary PUT error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật từ vựng." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Bạn không có quyền quản trị viên." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID từ vựng cần xóa." }, { status: 400 });
    }

    const deleted = await db.vocabulary.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, item: deleted });
  } catch (error) {
    console.error("Vocabulary DELETE error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa từ vựng." }, { status: 500 });
  }
}
