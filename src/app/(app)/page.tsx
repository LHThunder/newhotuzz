import { MissionControl } from "@/components/dashboard/mission-control";
import { localeFor } from "@/lib/settings-config";
import { ensureUser } from "@/server/services/user.service";
import { taskService } from "@/server/services/task.service";
import { habitService } from "@/server/services/habit.service";
import { settingsService } from "@/server/services/settings.service";

export default async function DashboardPage() {
  const user = await ensureUser();

  const [tasks, habits, settings] = user
    ? await Promise.all([
        taskService.list(user.id),
        habitService.listWithToday(user.id),
        settingsService.get(user.id),
      ])
    : [[], [], null];

  const name = user?.name || "bạn";
  const locale = localeFor[settings?.language ?? "vi"] ?? "vi-VN";

  return (
    <MissionControl
      name={name}
      locale={locale}
      tasks={tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, status: t.status, project: t.project }))}
      habits={habits.map((h) => ({ id: h.id, name: h.name, emoji: h.emoji, color: h.color, doneToday: h.doneToday }))}
    />
  );
}
