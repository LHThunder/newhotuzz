import { prisma } from "@/lib/prisma";
import { TasksView } from "@/components/tasks/tasks-view";
import { ensureUser } from "@/server/services/user.service";
import { taskService } from "@/server/services/task.service";

export const metadata = { title: "Tasks — LIFE OS" };

export default async function TasksPage() {
  const user = await ensureUser();
  const [tasks, projects] = user
    ? await Promise.all([
        taskService.list(user.id),
        prisma.project.findMany({ where: { userId: user.id, archivedAt: null }, select: { id: true, name: true }, orderBy: { createdAt: "desc" } }),
      ])
    : [[], []];
  return <TasksView tasks={tasks} projects={projects} />;
}
