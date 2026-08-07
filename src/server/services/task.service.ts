import { prisma } from "@/lib/prisma";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations/task";

/**
 * Task service — the ONLY place that talks to Prisma for tasks.
 * UI → server action → this service → prisma. Keeps business logic testable.
 */
export const taskService = {
  list(userId: string, filter?: { status?: string; projectId?: string }) {
    return prisma.task.findMany({
      where: {
        userId,
        archivedAt: null,
        ...(filter?.status ? { status: filter.status as never } : {}),
        ...(filter?.projectId ? { projectId: filter.projectId } : {}),
      },
      include: { subtasks: true, tags: true, project: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  },

  today(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return prisma.task.findMany({
      where: { userId, archivedAt: null, dueDate: { gte: start, lt: end } },
      orderBy: { priority: "desc" },
    });
  },

  async addSubtask(userId: string, taskId: string, title: string) {
    await taskService.assertOwner(userId, taskId);
    return prisma.subtask.create({ data: { taskId, title } });
  },

  async toggleSubtask(userId: string, subtaskId: string) {
    const st = await prisma.subtask.findUnique({ where: { id: subtaskId }, include: { task: true } });
    if (!st || st.task.userId !== userId) throw new Error("Không có quyền.");
    return prisma.subtask.update({ where: { id: subtaskId }, data: { done: !st.done } });
  },

  async removeSubtask(userId: string, subtaskId: string) {
    const st = await prisma.subtask.findUnique({ where: { id: subtaskId }, include: { task: true } });
    if (!st || st.task.userId !== userId) throw new Error("Không có quyền.");
    return prisma.subtask.delete({ where: { id: subtaskId } });
  },

  create(userId: string, input: CreateTaskInput) {
    const { tagIds, ...rest } = input;
    return prisma.task.create({
      data: {
        ...rest,
        userId,
        ...(tagIds?.length
          ? { tags: { connect: tagIds.map((id) => ({ id })) } }
          : {}),
      },
    });
  },

  async update(userId: string, input: UpdateTaskInput) {
    const { id, tagIds, ...rest } = input;
    await taskService.assertOwner(userId, id);
    return prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(tagIds ? { tags: { set: tagIds.map((t) => ({ id: t })) } } : {}),
      },
    });
  },

  async toggleDone(userId: string, id: string) {
    const task = await taskService.assertOwner(userId, id);
    const done = task.status !== "DONE";
    return prisma.task.update({
      where: { id },
      data: { status: done ? "DONE" : "TODO", completedAt: done ? new Date() : null },
    });
  },

  async remove(userId: string, id: string) {
    await taskService.assertOwner(userId, id);
    return prisma.task.update({ where: { id }, data: { archivedAt: new Date() } });
  },

  async assertOwner(userId: string, id: string) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task || task.userId !== userId) throw new Error("Không tìm thấy hoặc không có quyền.");
    return task;
  },
};
