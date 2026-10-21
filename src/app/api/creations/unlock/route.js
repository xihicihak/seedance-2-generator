import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { creationId } = body;

    if (!creationId) {
      return NextResponse.json({ error: "Creation ID is required" }, { status: 400 });
    }

    const creation = await prisma.creation.findUnique({
      where: { id: creationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!creation) {
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    if (!creation.isPublished) {
      return NextResponse.json({ error: "This video has not been published to the square" }, { status: 400 });
    }

    const buyerId = session.user.id;

    // If the buyer is the creator, they already own this creation
    if (creation.userId === buyerId) {
      return NextResponse.json({
        success: true,
        isUnlocked: true,
        message: "You are the creator of this video.",
      });
    }

    // Check if already purchased
    const existingPurchase = await prisma.creationPurchase.findUnique({
      where: {
        userId_creationId: {
          userId: buyerId,
          creationId: creation.id,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        isUnlocked: true,
        message: "Video is already unlocked.",
      });
    }

    // Check buyer balance
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { id: true, credits: true },
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer account not found" }, { status: 404 });
    }

    const price = creation.price > 0 ? creation.price : 10;
    if (buyer.credits < price) {
      return NextResponse.json(
        {
          error: "insufficient_credits",
          needed: price,
          current: buyer.credits,
        },
        { status: 400 }
      );
    }

    // Revenue Split Calculation:
    // 60% to Creator (used to continue creating videos)
    // 20% Platform Maintenance Fee
    // 20% Platform Margin
    const creatorAmount = Math.floor(price * 0.60);
    const maintenanceFee = Math.floor(price * 0.20);
    const platformFee = price - creatorAmount - maintenanceFee;

    const txOps = [
      // 1. Deduct buyer credits with atomic gte constraint (prevents concurrent double spending)
      prisma.user.update({
        where: { id: buyerId, credits: { gte: price } },
        data: { credits: { decrement: price } },
        select: { id: true, credits: true },
      }),
      // 2. Record purchase
      prisma.creationPurchase.create({
        data: {
          userId: buyerId,
          creationId: creation.id,
          creatorId: creation.userId || "platform",
          amountPaid: price,
          creatorAmount,
          maintenanceFee,
          platformFee,
        },
      }),
    ];

    // 3. Increment creator credits if creator account exists
    if (creation.userId) {
      txOps.push(
        prisma.user.update({
          where: { id: creation.userId },
          data: { credits: { increment: creatorAmount } },
        })
      );
    }

    const [updatedBuyer, purchaseRecord] = await prisma.$transaction(txOps);

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      newCredits: updatedBuyer.credits,
      amountPaid: price,
      creatorAmount,
      maintenanceFee,
      platformFee,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "insufficient_credits", message: "Insufficient credits available." },
        { status: 400 }
      );
    }
    console.error("Unlock creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unlock creation" },
      { status: 500 }
    );
  }
}
