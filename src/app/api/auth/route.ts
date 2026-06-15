import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/utils";

async function seedDatabaseIfEmpty() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log("Database is empty, auto-seeding users...");
      
      const studentUsername = "nhi0908664418";
      const studentPasswordHash = hashPassword("taptrung");
      await prisma.user.upsert({
        where: { username: studentUsername },
        update: { passwordHash: studentPasswordHash },
        create: {
          username: studentUsername,
          passwordHash: studentPasswordHash,
          fullName: "Nhi Superbrain",
          powerScore: 1200,
          theme: "light",
          language: "vi",
          level: "Basic",
          role: "user",
        },
      });

      const adminUsername = "admin";
      const adminPasswordHash = hashPassword("Freem@th");
      await prisma.user.upsert({
        where: { username: adminUsername },
        update: { passwordHash: adminPasswordHash },
        create: {
          username: adminUsername,
          passwordHash: adminPasswordHash,
          fullName: "System Administrator",
          powerScore: 9999,
          theme: "light",
          language: "vi",
          level: "Basic",
          role: "admin",
        },
      });
      console.log("Database auto-seeded successfully!");
    }
  } catch (err) {
    console.error("Auto-seeding failed:", err);
  }
}

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionCookie.value },
      select: {
        id: true,
        username: true,
        fullName: true,
        powerScore: true,
        theme: true,
        language: true,
        level: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await seedDatabaseIfEmpty();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Strip password hash by selecting specific fields
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      powerScore: user.powerScore,
      theme: user.theme,
      language: user.language,
      level: user.level,
      role: user.role,
    };

    return NextResponse.json({ authenticated: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
