import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionCookie.value;

    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20 // return last 20 records
    });

    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const body = await request.json();
    const { type, mode, config, score, totalQns, correctQns } = body;

    if (!type || !mode || !config || score === undefined || totalQns === undefined || correctQns === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Save history record
    const historyRecord = await prisma.history.create({
      data: {
        userId,
        type,
        mode,
        config,
        score,
        totalQns,
        correctQns
      }
    });

    // Update user powerScore in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      const newScore = Math.max(0, user.powerScore + score);
      await prisma.user.update({
        where: { id: userId },
        data: { powerScore: newScore }
      });
    }

    return NextResponse.json({ success: true, historyRecord });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
