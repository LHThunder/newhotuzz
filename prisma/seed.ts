import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seeds sample data.
 * - By default creates a standalone demo user (inspect via `npm run db:studio`).
 * - Set SEED_USER_ID to your real Supabase auth uid to populate YOUR account,
 *   e.g.  SEED_USER_ID=xxxx-uuid  npm run db:seed
 */
async function main() {
  const userId = process.env.SEED_USER_ID ?? "demo-user";

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: process.env.SEED_USER_ID ? `${userId}@user.local` : "demo@life-os.app",
      name: "Tùng",
      settings: { create: {} },
    },
  });

  // Projects
  const startup = await prisma.project.create({
    data: { userId: user.id, name: "Startup", emoji: "🚀", color: "#8b5cf6" },
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      { userId: user.id, title: "Hoàn thiện pitch deck", priority: "URGENT", status: "TODO", projectId: startup.id },
      { userId: user.id, title: "Code module Auth", priority: "HIGH", status: "IN_PROGRESS", projectId: startup.id },
      { userId: user.id, title: "Đọc 30 trang 'Deep Work'", priority: "LOW", status: "TODO" },
    ],
  });

  // Habits
  await prisma.habit.createMany({
    data: [
      { userId: user.id, name: "Thiền", emoji: "🧘", color: "#22c55e" },
      { userId: user.id, name: "Đọc sách", emoji: "📚", color: "#38bdf8" },
      { userId: user.id, name: "Tập gym", emoji: "💪", color: "#f472b6" },
    ],
  });

  // Goal + milestones
  await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Ra mắt startup & đạt 1.000 người dùng",
      horizon: "YEAR",
      progress: 60,
      projectId: startup.id,
      milestones: {
        create: [
          { title: "Hoàn thiện MVP", done: true, order: 1 },
          { title: "Public beta", done: true, order: 2 },
          { title: "1.000 người dùng", done: false, order: 3 },
        ],
      },
    },
  });

  // Finance
  await prisma.account.createMany({
    data: [
      { userId: user.id, name: "Tiền mặt", kind: "cash", balance: 8_500_000 },
      { userId: user.id, name: "Techcombank", kind: "bank", balance: 62_000_000 },
    ],
  });

  console.log(`✅ Seeded data for user: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
