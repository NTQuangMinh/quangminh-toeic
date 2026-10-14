import { NextRequest, NextResponse } from "next/server";
import { askAITutor, AITutorRequest } from "@/lib/ai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`ai:${ip}`, 20, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Bạn đã gửi quá nhiều câu hỏi trong thời gian ngắn. Vui lòng đợi 1 phút trước khi hỏi tiếp." },
        { status: 429 }
      );
    }

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
