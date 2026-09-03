import { CalendarClock, Target, CheckSquare, Repeat } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { reviewService } from "@/server/services/review.service";
import { weekBounds, weekKey, weekLabel } from "@/lib/period";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReflectionForm } from "@/components/review/reflection-form";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Weekly Planning — LIFE OS" };

export default async function WeeklyPlanningPage() {
  const user = await ensureUser();
  const { start, end } = weekBounds();
  const key = weekKey();

  const [tasks, goals, habitCount, plan] = user
    ? await Promise.all([
        prisma.task.findMany({ where: { userId: user.id, archivedAt: null, dueDate: { gte: start, lt: end }, status: { not: "DONE" } }, orderBy: { priority: "desc" }, take: 20 }),
        prisma.goal.findMany({ where: { userId: user.id, status: "active" }, take: 10 }),
        prisma.habit.count({ where: { userId: user.id, archivedAt: null } }),
        reviewService.get(user.id, "weekly_plan", key),
      ])
    : [[], [], 0, null];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarClock className="size-6 text-primary" /> Weekly Planning
        </h1>
        <p className="text-sm text-muted-foreground">Tuần {key} · {weekLabel()}</p>
      </div>

      <ReflectionForm
        type="weekly_plan"
        periodKey={key}
        initial={(plan?.data as Record<string, string>) ?? {}}
        fields={[
          { key: "goals", label: "🎯 Mục tiêu chính tuần này", placeholder: "3 điều quan trọng nhất cần đạt…" },
          { key: "focus", label: "🔑 Ưu tiên & dự án", placeholder: "Dự án/việc cần tập trung…" },
          { key: "notes", label: "📝 Ghi chú", placeholder: "Lưu ý khác…" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat icon={CheckSquare} label="Task đến hạn tuần này" value={`${tasks.length}`} />
        <MiniStat icon={Target} label="Mục tiêu đang chạy" value={`${goals.length}`} />
        <MiniStat icon={Repeat} label="Thói quen cần duy trì" value={`${habitCount}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Task đến hạn trong tuần</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {tasks.length === 0 ? (
            <EmptyState icon={CheckSquare} title="Không có task đến hạn" description="Đặt hạn chót cho task ở trang Tasks để xuất hiện ở đây." className="border-0 py-6" />
          ) : tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-accent/30">
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="flex-1 truncate">{t.title}</span>
              {t.dueDate && <span className="text-xs text-muted-foreground">{new Date(t.dueDate).toLocaleDateString("vi-VN", { weekday: "short" })}</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <Card className="p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
