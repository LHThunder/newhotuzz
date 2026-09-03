import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Range = { start: Date; end: Date };

export const reviewService = {
  get(userId: string, type: string, periodKey: string) {
    return prisma.review.findUnique({
      where: { userId_type_periodKey: { userId, type, periodKey } },
    });
  },

  save(userId: string, type: string, periodKey: string, data: Prisma.InputJsonValue) {
    return prisma.review.upsert({
      where: { userId_type_periodKey: { userId, type, periodKey } },
      update: { data },
      create: { userId, type, periodKey, data },
    });
  },

  /** Aggregate statistics for a date range (week or month). */
  async stats(userId: string, { start, end }: Range) {
    const [tasksDone, tasksCreated, habits, habitLogs, txns, books, movies] = await Promise.all([
      prisma.task.count({ where: { userId, status: "DONE", completedAt: { gte: start, lt: end } } }),
      prisma.task.count({ where: { userId, createdAt: { gte: start, lt: end } } }),
      prisma.habit.count({ where: { userId, archivedAt: null } }),
      prisma.habitLog.count({ where: { userId, date: { gte: start, lt: end } } }),
      prisma.transaction.findMany({ where: { userId, date: { gte: start, lt: end } }, select: { type: true, amount: true } }),
      prisma.book.count({ where: { userId, status: "done", createdAt: { gte: start, lt: end } } }),
      prisma.movie.count({ where: { userId, status: "watched", createdAt: { gte: start, lt: end } } }),
    ]);

    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    const habitTarget = habits * days;
    const habitRate = habitTarget ? Math.round((habitLogs / habitTarget) * 100) : 0;

    const income = txns.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
    const expense = txns.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);

    return {
      tasksDone, tasksCreated, habitLogs, habitRate,
      income, expense, savings: income - expense,
      booksFinished: books, moviesWatched: movies,
    };
  },
};
