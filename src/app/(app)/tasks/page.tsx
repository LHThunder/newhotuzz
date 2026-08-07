import { TasksView } from "@/components/tasks/tasks-view";
import { ensureUser } from "@/server/services/user.service";
import { taskService } from "@/server/services/task.service";

export const metadata = { title: "Tasks — LIFE OS" };

export default async function TasksPage() {
  const user = await ensureUser();
  const tasks = user ? await taskService.list(user.id) : [];
  return <TasksView tasks={tasks} />;
}
