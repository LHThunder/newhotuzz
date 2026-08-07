import { prisma } from "@/lib/prisma";

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const habitService = {
  /** Habits with a flag for whether they're logged today. */
  async listWithToday(userId: string) {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
      orderBy: { createdAt: "asc" },
    });
    const logs = await prisma.habitLog.findMany({
      where: { userId, date: today() },
    });
    const doneSet = new Set(logs.map((l) => l.habitId));

    // Compute a simple current streak per habit from its logs.
    return habits.map((h) => ({ ...h, doneToday: doneSet.has(h.id) }));
  },

  create(userId: string, name: string, emoji?: string, color?: string) {
    return prisma.habit.create({
      data: { userId, name, emoji: emoji ?? "✅", color: color ?? "#22c55e" },
    });
  },

  /** Toggle today's completion for a habit. */
  async toggleToday(userId: string, habitId: string) {
    const date = today();
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date } },
    });
    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      return { done: false };
    }
    await prisma.habitLog.create({ data: { userId, habitId, date } });
    return { done: true };
  },
};
