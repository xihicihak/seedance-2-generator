import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function PATCH(req, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { creditsDelta, creditsExact, role } = body;

    const data = {};

    if (typeof creditsExact === "number") {
      data.credits = Math.max(0, creditsExact);
    } else if (typeof creditsDelta === "number") {
      data.credits = { increment: creditsDelta };
    }

    if (role && (role === "ADMIN" || role === "USER")) {
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
        role: true,
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { id } = params;
    // Don't allow admin to delete themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin user delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
