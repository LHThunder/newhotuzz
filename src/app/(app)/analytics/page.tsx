import { CheckSquare, Repeat, Target, BookOpen, Brain, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Analytics — LIFE OS" };

export default async function AnalyticsPage() {
  const user = await ensureUser();

  const [tasksTotal, tasksDone, habits, habitLogs, goals, journal, notes, txns] = user
    ? await Promise.all([
        prisma.task.count({ where: { userId: user.id, archivedAt: null } }),
        prisma.task.count({ where: { userId: user.id, status: "DONE" } }),
        prisma.habit.count({ where: { userId: user.id, archivedAt: null } }),
        prisma.habitLog.count({ where: { userId: user.id } }),
        prisma.goal.count({ where: { userId: user.id } }),
        prisma.journalEntry.count({ where: { userId: user.id } }),
        prisma.note.count({ where: { userId: user.id, archivedAt: null } }),
        prisma.transaction.count({ where: { userId: user.id } }),
      ])
    : [0, 0, 0, 0, 0, 0, 0, 0];

  const taskRate = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const stats = [
    { icon: CheckSquare, label: "Tasks hoàn thành", value: `${tasksDone}/${tasksTotal}`, sub: `${taskRate}%`, color: "--accent-task" },
    { icon: Repeat, label: "Thói quen", value: `${habits}`, sub: `${habitLogs} lần check-in`, color: "--accent-habit" },
    { icon: Target, label: "Mục tiêu", value: `${goals}`, sub: "đang theo dõi", color: "--accent-goal" },
    { icon: BookOpen, label: "Nhật ký", value: `${journal}`, sub: "bài viết", color: "--accent-brain" },
    { icon: Brain, label: "Ghi chú", value: `${notes}`, sub: "trong Second Brain", color: "--accent-learning" },
    { icon: Wallet, label: "Giao dịch", value: `${txns}`, sub: "đã ghi", color: "--accent-finance" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Tổng quan dữ liệu & tiến bộ của bạn.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="grid size-9 place-items-center rounded-lg" style={{ background: `hsl(var(${s.color}) / 0.15)`, color: `hsl(var(${s.color}))` }}>
                <s.icon className="size-4" />
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground/70">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Các điểm số nâng cao (Productivity, Health, Balance…) sẽ tự tính khi bạn tích luỹ thêm dữ liệu mỗi ngày.
      </p>
    </div>
  );
}
