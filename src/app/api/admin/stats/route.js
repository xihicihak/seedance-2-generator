import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCreations,
      completedCreations,
      failedCreations,
      processingCreations,
      todayCreations,
      allUsersCredits,
      recentUsers,
      recentCreations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.creation.count(),
      prisma.creation.count({ where: { status: "completed" } }),
      prisma.creation.count({ where: { status: "failed" } }),
      prisma.creation.count({ where: { status: "processing" } }),
      prisma.creation.count({ where: { createdAt: { gte: today } } }),
      prisma.user.aggregate({ _sum: { credits: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.creation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCreations,
        completedCreations,
        failedCreations,
        processingCreations,
        todayCreations,
        totalCredits: allUsersCredits._sum.credits || 0,
      },
      recentUsers,
      recentCreations,
      system: {
        comfyUiUrl: process.env.COMFYUI_API_URL || "http://127.0.0.1:8188",
        nodeEnv: process.env.NODE_ENV || "production",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://www.pornmakes.com",
        engine: "Wan 2.2 Studio (14B T2V/I2V)"
      }
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
