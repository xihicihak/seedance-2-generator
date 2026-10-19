import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "my";

  try {
    // 1. Community Square Tab
    if (tab === "square") {
      const creations = await prisma.creation.findMany({
        where: {
          isPublished: true,
          status: { not: "failed" },
        },
        orderBy: { createdAt: "desc" },
        take: 60,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          purchases: {
            select: { userId: true },
          },
        },
      });

      const currentUserId = session?.user?.id;
      const formatted = creations.map((c) => {
        let imagesList = [];
        if (c.inputImages) {
          try {
            imagesList = JSON.parse(c.inputImages);
            if (!Array.isArray(imagesList)) imagesList = [c.inputImages];
          } catch (e) {
            imagesList = c.inputImages.split(",").map((u) => u.trim()).filter(Boolean);
          }
        }

        const isOwner = currentUserId && c.userId === currentUserId;
        const hasPurchased = currentUserId && c.purchases.some((p) => p.userId === currentUserId);
        const isUnlocked = Boolean(isOwner || hasPurchased);

        return {
          id: c.id,
          prompt: c.prompt,
          imageUrl: c.imageUrl,
          videoFiles: c.videoFiles,
          inputImages: imagesList,
          aspectRatio: c.aspectRatio,
          resolution: c.resolution,
          quality: c.quality,
          duration: c.duration,
          status: c.status,
          createdAt: c.createdAt,
          price: c.price || 10,
          isPublished: c.isPublished,
          isUnlocked,
          isOwner,
          salesCount: c.purchases.length,
          creator: {
            id: c.user?.id,
            name: c.user?.name || (c.user?.email ? c.user.email.split("@")[0] : "Creator"),
            image: c.user?.image || null,
          },
        };
      });

      return NextResponse.json(formatted);
    }

    // 2. Personal Vault Tab (tab === "my")
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const myCreations = await prisma.creation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        purchases: {
          select: { id: true, amountPaid: true, creatorAmount: true, createdAt: true },
        },
      },
    });

    const parsedMyCreations = myCreations.map((c) => {
      let imagesList = [];
      if (c.inputImages) {
        try {
          imagesList = JSON.parse(c.inputImages);
          if (!Array.isArray(imagesList)) imagesList = [c.inputImages];
        } catch (e) {
          imagesList = c.inputImages.split(",").map((url) => url.trim()).filter(Boolean);
        }
      }
      const earnedCredits = c.purchases.reduce((acc, p) => acc + (p.creatorAmount || 0), 0);

      return {
        ...c,
        inputImages: imagesList,
        isUnlocked: true,
        isOwner: true,
        salesCount: c.purchases.length,
        earnedCredits,
      };
    });

    return NextResponse.json(parsedMyCreations);
  } catch (error) {
    console.error("Fetch creations error:", error);
    return NextResponse.json({ error: "Failed to fetch creations" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, isPublished, price } = body;

    if (!id) {
      return NextResponse.json({ error: "Creation id is required" }, { status: 400 });
    }

    const creation = await prisma.creation.findUnique({
      where: { id },
    });

    if (!creation) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.email === "xihicihak43@gmail.com";
    if (creation.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this creation" }, { status: 403 });
    }

    const updateData = {};
    if (typeof isPublished === "boolean") {
      updateData.isPublished = isPublished;
    }
    if (typeof price === "number" && price >= 0) {
      updateData.price = Math.round(price);
    }

    const updated = await prisma.creation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, creation: updated });
  } catch (error) {
    console.error("Update creation status error:", error);
    return NextResponse.json({ error: error.message || "Failed to update creation" }, { status: 500 });
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
      where: { id },
    });

    if (!creation) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.email === "xihicihak43@gmail.com";
    if (creation.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this creation" }, { status: 403 });
    }

    await prisma.creation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete creation" }, { status: 500 });
  }
}
