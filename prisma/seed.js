import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding local database...");
  const adminEmail = "xihicihak43@gmail.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      credits: 1000,
    },
    create: {
      email: adminEmail,
      name: "Admin Master",
      role: "ADMIN",
      credits: 1000,
    },
  });

  console.log("Admin user seeded:", admin);

  // Seed sample community creators
  const creator1 = await prisma.user.upsert({
    where: { email: "eva_creator@seedance.ai" },
    update: {},
    create: {
      email: "eva_creator@seedance.ai",
      name: "Eva CyberLab",
      credits: 200,
      role: "USER",
    },
  });

  const creator2 = await prisma.user.upsert({
    where: { email: "neo_director@seedance.ai" },
    update: {},
    create: {
      email: "neo_director@seedance.ai",
      name: "Neo Cinematic",
      credits: 350,
      role: "USER",
    },
  });

  // Seed published videos in community square
  const video1 = await prisma.creation.upsert({
    where: { requestId: "showcase-seed-1" },
    update: {},
    create: {
      requestId: "showcase-seed-1",
      userId: creator1.id,
      prompt: "Cyberpunk protagonist on neon-lit rain rooftop, hyper-realistic motion, cinematic lighting, 8k",
      videoFiles: ["https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41551-large.mp4"],
      quality: "Wan 2.2 14B",
      status: "completed",
      isPublished: true,
      price: 10,
    },
  });

  const video2 = await prisma.creation.upsert({
    where: { requestId: "showcase-seed-2" },
    update: {},
    create: {
      requestId: "showcase-seed-2",
      userId: creator2.id,
      prompt: "Elegantly animated fashion portrait with dramatic rim lighting and dynamic particle motion",
      videoFiles: ["https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4"],
      quality: "Wan 2.2 Turbo",
      status: "completed",
      isPublished: true,
      price: 10,
    },
  });

  const video3 = await prisma.creation.upsert({
    where: { requestId: "showcase-seed-3" },
    update: {},
    create: {
      requestId: "showcase-seed-3",
      userId: creator1.id,
      prompt: "High-octane neon night racing through Tokyo hyper-speed expressway, realistic car reflections, photorealistic 60fps",
      videoFiles: ["https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-42589-large.mp4"],
      quality: "Wan 2.2 14B",
      status: "completed",
      isPublished: true,
      price: 15,
    },
  });

  console.log("Community square seed completed:", { creator1: creator1.id, creator2: creator2.id, count: 3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
