import { prisma } from "@/lib/prisma";
import type { CreateGoalInput } from "@/lib/validations/goal";

export const goalService = {
  /** All goals for a horizon, with milestones and children. */
  listByHorizon(userId: string, horizon?: string) {
    return prisma.goal.findMany({
      where: { userId, ...(horizon ? { horizon: horizon as never } : {}) },
      include: { milestones: { orderBy: { order: "asc" } }, children: true, project: true },
      orderBy: { createdAt: "desc" },
    });
  },

  vision(userId: string) {
    return prisma.goal.findFirst({ where: { userId, horizon: "VISION" } });
  },

  create(userId: string, input: CreateGoalInput) {
    return prisma.goal.create({ data: { ...input, userId } });
  },

  async setProgress(userId: string, id: string, progress: number) {
    await goalService.assertOwner(userId, id);
    return prisma.goal.update({
      where: { id },
      data: { progress, status: progress >= 100 ? "done" : "active" },
    });
  },

  /** Toggle a milestone and recompute the parent goal's progress from its milestones. */
  async toggleMilestone(userId: string, milestoneId: string) {
    const m = await prisma.milestone.findUnique({ where: { id: milestoneId }, include: { goal: true } });
    if (!m || m.goal.userId !== userId) throw new Error("Không có quyền.");

    await prisma.milestone.update({ where: { id: milestoneId }, data: { done: !m.done } });

    const all = await prisma.milestone.findMany({ where: { goalId: m.goalId } });
    const done = all.filter((x) => x.done).length;
    const progress = all.length ? Math.round((done / all.length) * 100) : 0;
    return prisma.goal.update({ where: { id: m.goalId }, data: { progress } });
  },

  async addMilestone(userId: string, goalId: string, title: string) {
    await goalService.assertOwner(userId, goalId);
    const count = await prisma.milestone.count({ where: { goalId } });
    await prisma.milestone.create({ data: { goalId, title, order: count + 1 } });
    // Recompute progress after adding.
    return goalService.recompute(goalId);
  },

  async deleteMilestone(userId: string, milestoneId: string) {
    const m = await prisma.milestone.findUnique({ where: { id: milestoneId }, include: { goal: true } });
    if (!m || m.goal.userId !== userId) throw new Error("Không có quyền.");
    await prisma.milestone.delete({ where: { id: milestoneId } });
    return goalService.recompute(m.goalId);
  },

  async deleteGoal(userId: string, id: string) {
    await goalService.assertOwner(userId, id);
    return prisma.goal.delete({ where: { id } });
  },

  async setProgressManual(userId: string, id: string, progress: number) {
    await goalService.assertOwner(userId, id);
    return prisma.goal.update({ where: { id }, data: { progress, status: progress >= 100 ? "done" : "active" } });
  },

  async recompute(goalId: string) {
    const all = await prisma.milestone.findMany({ where: { goalId } });
    const done = all.filter((x) => x.done).length;
    const progress = all.length ? Math.round((done / all.length) * 100) : 0;
    return prisma.goal.update({ where: { id: goalId }, data: { progress } });
  },

  async assertOwner(userId: string, id: string) {
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) throw new Error("Không tìm thấy hoặc không có quyền.");
    return goal;
  },
};
