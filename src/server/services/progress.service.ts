import { prisma } from "@/lib/prisma";

/**
 * Task-based progress per project for a user.
 * Returns Map<projectId, { total, done, percent }>.
 * Progress = completed tasks / total tasks × 100.
 */
export async function projectProgress(userId: string) {
  const rows = await prisma.task.groupBy({
    by: ["projectId", "status"],
    where: { userId, archivedAt: null, projectId: { not: null } },
    _count: { _all: true },
  });

  const map = new Map<string, { total: number; done: number; percent: number }>();
  for (const r of rows) {
    if (!r.projectId) continue;
    const entry = map.get(r.projectId) ?? { total: 0, done: 0, percent: 0 };
    entry.total += r._count._all;
    if (r.status === "DONE") entry.done += r._count._all;
    map.set(r.projectId, entry);
  }
  for (const entry of map.values()) {
    entry.percent = entry.total ? Math.round((entry.done / entry.total) * 100) : 0;
  }
  return map;
}
