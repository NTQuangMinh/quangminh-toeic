import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, dailyGoalTarget } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên, email và mật khẩu." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "Email này đã được sử dụng. Vui lòng đăng nhập." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const target = dailyGoalTarget ? Number(dailyGoalTarget) : 20;

    const newUser = await db.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash,
        role: "USER",
        dailyGoalTarget: target,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau." }, { status: 500 });
  }
}
