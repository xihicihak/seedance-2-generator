import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET(req) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "all").trim();
    const query = (searchParams.get("search") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (query) {
      where.OR = [
        { prompt: { contains: query, mode: "insensitive" } },
        { id: { contains: query, mode: "insensitive" } },
        { requestId: { contains: query, mode: "insensitive" } },
        { user: { email: { contains: query, mode: "insensitive" } } }
      ];
    }

    const [total, creations] = await Promise.all([
      prisma.creation.count({ where }),
      prisma.creation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);

    return NextResponse.json({
      creations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Admin creations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Creation ID required" }, { status: 400 });
    }

    await prisma.creation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin creation delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
