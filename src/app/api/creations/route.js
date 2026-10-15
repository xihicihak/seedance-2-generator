import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const creations = await prisma.creation.findMany({
      where: { 
        userId: session.user.id
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedCreations = creations.map(c => {
      let imagesList = [];
      if (c.inputImages) {
        try {
          imagesList = JSON.parse(c.inputImages);
          if (!Array.isArray(imagesList)) {
            imagesList = [c.inputImages];
          }
        } catch (e) {
          imagesList = c.inputImages.split(",").map(url => url.trim()).filter(Boolean);
        }
      }
      return {
        ...c,
        inputImages: imagesList
      };
    });

    return NextResponse.json(parsedCreations);
  } catch (error) {
    console.error("Fetch creations error:", error);
    return NextResponse.json({ error: "Failed to fetch creations" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Creation id is required" }, { status: 400 });
    }

    const creation = await prisma.creation.findUnique({
      where: { id }
    });

    if (!creation) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.email === "xihicihak43@gmail.com";
    if (creation.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this creation" }, { status: 403 });
    }

    await prisma.creation.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete creation" }, { status: 500 });
  }
}
