import { prisma } from "@/lib/prisma";

function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toKey(d: Date) {
  return dayStart(d).toISOString().slice(0, 10);
}

export const habitService = {
  /** Simple list with today flag — used by the dashboard. */
  async listWithToday(userId: string) {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
      orderBy: { createdAt: "asc" },
    });
    const logs = await prisma.habitLog.findMany({ where: { userId, date: dayStart() } });
    const doneSet = new Set(logs.map((l) => l.habitId));
    return habits.map((h) => ({ ...h, doneToday: doneSet.has(h.id) }));
  },

  /** Rich list for the Habits page: streak, last-7-days grid, completion %. */
  async listDetailed(userId: string) {
    const habits = await prisma.habit.findMany({
      where: { userId, archivedAt: null },
      orderBy: { createdAt: "asc" },
    });

    const since = dayStart();
    since.setDate(since.getDate() - 90);
    const logs = await prisma.habitLog.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "desc" },
    });

    // Group log day-keys per habit.
    const byHabit = new Map<string, Set<string>>();
    for (const l of logs) {
      if (!byHabit.has(l.habitId)) byHabit.set(l.habitId, new Set());
      byHabit.get(l.habitId)!.add(toKey(l.date));
    }

    const todayKey = toKey(new Date());

    return habits.map((h) => {
      const days = byHabit.get(h.id) ?? new Set<string>();

      // Current streak: count back from today (or yesterday) while days are present.
      let streak = 0;
      const cursor = new Date();
      // If not done today, streak can still count up to yesterday.
      if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
      while (days.has(toKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }

      // Last 7 days grid (oldest → newest).
      const last7: { key: string; done: boolean; label: string }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7.push({ key: toKey(d), done: days.has(toKey(d)), label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()] });
      }

      // Completion % over last 30 days.
      let done30 = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (days.has(toKey(d))) done30++;
      }

      return { ...h, doneToday: days.has(todayKey), streak, last7, completion: Math.round((done30 / 30) * 100) };
    });
  },

  create(userId: string, name: string, emoji?: string, color?: string) {
    return prisma.habit.create({
      data: { userId, name, emoji: emoji ?? "✅", color: color ?? "#22c55e" },
    });
  },

  async update(userId: string, id: string, data: { name?: string; emoji?: string; color?: string }) {
    const owned = await prisma.habit.findFirst({ where: { id, userId } });
    if (!owned) throw new Error("Không có quyền.");
    return prisma.habit.update({ where: { id }, data });
  },

  async remove(userId: string, id: string) {
    const owned = await prisma.habit.findFirst({ where: { id, userId } });
    if (!owned) throw new Error("Không có quyền.");
    return prisma.habit.delete({ where: { id } });
  },

  /** Toggle completion for a habit on a specific day (defaults to today). */
  async toggleOnDate(userId: string, habitId: string, date = new Date()) {
    const owned = await prisma.habit.findFirst({ where: { id: habitId, userId } });
    if (!owned) throw new Error("Không có quyền.");
    const day = dayStart(date);
    const existing = await prisma.habitLog.findUnique({ where: { habitId_date: { habitId, date: day } } });
    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      return { done: false };
    }
    await prisma.habitLog.create({ data: { userId, habitId, date: day } });
    return { done: true };
  },

  toggleToday(userId: string, habitId: string) {
    return habitService.toggleOnDate(userId, habitId);
  },
};
