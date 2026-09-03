import { Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalCreate } from "@/components/goals/goal-create";
import { EmptyState } from "@/components/ui/empty-state";
import { ensureUser } from "@/server/services/user.service";
import { goalService } from "@/server/services/goal.service";
import { projectProgress } from "@/server/services/progress.service";

export const metadata = { title: "Goals — LIFE OS" };

export default async function GoalsPage() {
  const user = await ensureUser();

  const [goals, projects, progress] = user
    ? await Promise.all([
        goalService.listByHorizon(user.id),
        prisma.project.findMany({ where: { userId: user.id, archivedAt: null }, select: { id: true, name: true }, orderBy: { createdAt: "desc" } }),
        projectProgress(user.id),
      ])
    : [[], [], new Map()];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <GoalCreate />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Chưa có mục tiêu nào"
          description="Bấm “Mục tiêu mới” để đặt mục tiêu đầu tiên — chọn tầng (Năm/Quý/Tháng…) và deadline."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((g, i) => {
            // Progress from linked project's tasks if present, else milestone-based.
            const linked = g.projectId ? progress.get(g.projectId) : undefined;
            const effective = linked ? linked.percent : g.progress;
            return (
              <GoalCard
                key={g.id}
                delay={i * 0.06}
                projects={projects}
                projectId={g.projectId}
                goal={{
                  id: g.id, title: g.title, horizon: g.horizon, progress: effective,
                  deadline: g.deadline, project: g.project, milestones: g.milestones,
                  fromProject: !!linked,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
