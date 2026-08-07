import { Target } from "lucide-react";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalCreate } from "@/components/goals/goal-create";
import { EmptyState } from "@/components/ui/empty-state";
import { ensureUser } from "@/server/services/user.service";
import { goalService } from "@/server/services/goal.service";

export const metadata = { title: "Goals — LIFE OS" };

export default async function GoalsPage() {
  const user = await ensureUser();
  const goals = user ? await goalService.listByHorizon(user.id) : [];

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
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} delay={i * 0.06} />
          ))}
        </div>
      )}
    </div>
  );
}
