import { NextRequest, NextResponse } from "next/server";
import { generateAIQuestion } from "@/lib/ai";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wordId } = body;

    let vocab = null;
    if (wordId) {
      vocab = await db.vocabulary.findUnique({ where: { id: wordId } });
    }

    if (!vocab) {
      return NextResponse.json({ error: "Không tìm thấy từ vựng tương ứng." }, { status: 404 });
    }

    const question = await generateAIQuestion({
      word: vocab.word,
      meaningVi: vocab.meaningVi,
      topic: vocab.topic,
      difficulty: vocab.difficulty,
      exampleSentence: vocab.exampleSentence,
    });

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("AI Generate Question error:", error);
    return NextResponse.json({ error: "Không thể tạo câu hỏi từ AI." }, { status: 500 });
  }
}
