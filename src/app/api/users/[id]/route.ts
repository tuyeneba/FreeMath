import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/utils";

async function getSessionUserId() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  return sessionCookie?.value || null;
}

async function isAdmin(currentUserId: string | null) {
  if (!currentUserId) return false;
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true }
  });
  return user?.role === "admin";
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getSessionUserId();
    if (!(await isAdmin(currentUserId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { username, fullName, password, level, role } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username }
      });
      if (existing) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }
    }

    const updateData: {
      username?: string;
      fullName?: string;
      level?: string;
      role?: string;
      passwordHash?: string;
      powerScore?: number;
    } = {};
    if (username !== undefined) updateData.username = username;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (level !== undefined) updateData.level = level;
    if (role !== undefined) updateData.role = role;
    if (password) {
      updateData.passwordHash = hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        level: updatedUser.level,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error("PUT User error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUserId = await getSessionUserId();
    if (!(await isAdmin(currentUserId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Check if user is attempting to delete themselves
    if (id === currentUserId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE User error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
