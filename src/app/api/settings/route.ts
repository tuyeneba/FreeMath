import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const body = await request.json();
    const { theme, language, level } = body;

    const dataToUpdate: {
      theme?: "light" | "dark";
      language?: "vi" | "en";
      level?: string;
    } = {};
    if (theme === "light" || theme === "dark") dataToUpdate.theme = theme;
    if (language === "vi" || language === "en") dataToUpdate.language = language;
    if (level) dataToUpdate.level = level;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        fullName: true,
        powerScore: true,
        theme: true,
        language: true,
        level: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
