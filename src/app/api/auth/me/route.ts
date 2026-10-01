import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        dailyGoalTarget: user.dailyGoalTarget,
      },
    });
  } catch (error) {
    console.error("Auth me check error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
