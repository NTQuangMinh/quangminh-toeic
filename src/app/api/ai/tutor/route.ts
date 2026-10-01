import { NextRequest, NextResponse } from "next/server";
import { askAITutor, AITutorRequest } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AITutorRequest;

    if (!body.word || !body.meaningVi) {
      return NextResponse.json({ error: "Thiếu thông tin từ vựng." }, { status: 400 });
    }

    const result = await askAITutor(body);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      isBuiltIn: result.isBuiltIn,
    });
  } catch (error) {
    console.error("AI Tutor API error:", error);
    return NextResponse.json({ error: "Lỗi kết nối với Trợ lý AI." }, { status: 500 });
  }
}
