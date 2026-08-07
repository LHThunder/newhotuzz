import { Trophy, Zap, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const metadata = { title: "Gamification — LIFE OS" };

export default async function GamificationPage() {
  const user = await ensureUser();

  const [tasksDone, habitLogs, journal, notes, goalsDone, txns] = user
    ? await Promise.all([
        prisma.task.count({ where: { userId: user.id, status: "DONE" } }),
        prisma.habitLog.count({ where: { userId: user.id } }),
        prisma.journalEntry.count({ where: { userId: user.id } }),
        prisma.note.count({ where: { userId: user.id, archivedAt: null } }),
        prisma.goal.count({ where: { userId: user.id, status: "done" } }),
        prisma.transaction.count({ where: { userId: user.id } }),
      ])
    : [0, 0, 0, 0, 0, 0];

  // XP derived from real activity.
  const xp = tasksDone * 10 + habitLogs * 5 + journal * 8 + notes * 3 + goalsDone * 50 + txns * 2;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpToNext = 500;

  const achievements = [
    { key: "first_task", icon: "✅", title: "Khởi đầu", desc: "Hoàn thành task đầu tiên", unlocked: tasksDone >= 1 },
    { key: "task_10", icon: "🎯", title: "Chăm chỉ", desc: "Hoàn thành 10 task", unlocked: tasksDone >= 10 },
    { key: "habit_7", icon: "🔥", title: "Kỷ luật", desc: "Check-in thói quen 7 lần", unlocked: habitLogs >= 7 },
    { key: "habit_30", icon: "💪", title: "Bền bỉ", desc: "Check-in thói quen 30 lần", unlocked: habitLogs >= 30 },
    { key: "writer", icon: "✍️", title: "Nhà văn", desc: "Viết nhật ký đầu tiên", unlocked: journal >= 1 },
    { key: "brain", icon: "🧠", title: "Bộ não thứ hai", desc: "Lưu 5 ghi chú", unlocked: notes >= 5 },
    { key: "goal", icon: "🏆", title: "Người hoàn thành", desc: "Đạt 1 mục tiêu", unlocked: goalsDone >= 1 },
    { key: "money", icon: "💰", title: "Nhà quản lý", desc: "Ghi giao dịch đầu tiên", unlocked: txns >= 1 },
  ];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gamification</h1>
        <p className="text-sm text-muted-foreground">XP & huy hiệu tích luỹ từ hoạt động mỗi ngày.</p>
      </div>

      {/* Level hero */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-14 size-52 rounded-full bg-amber-500/15 blur-3xl" />
        <CardContent className="pt-5">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white shadow-glow">
              {level}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Cấp độ</p>
              <p className="text-xl font-semibold">Level {level}</p>
              <div className="mt-2 flex items-center gap-2">
                <Zap className="size-4 text-amber-400" />
                <span className="text-sm font-medium tabular-nums">{xp.toLocaleString("vi-VN")} XP</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Level {level}</span>
              <span>{xpInLevel}/{xpToNext} XP → Level {level + 1}</span>
            </div>
            <Progress value={(xpInLevel / xpToNext) * 100} indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500" />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Trophy className="size-4 text-amber-400" /> Huy hiệu</CardTitle>
          <span className="text-xs text-muted-foreground">{unlockedCount}/{achievements.length}</span>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achievements.map((a) => (
            <div
              key={a.key}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-4 text-center transition-all",
                a.unlocked ? "border-amber-500/30 bg-amber-500/5" : "border-border opacity-50 grayscale",
              )}
            >
              <span className="text-3xl">{a.icon}</span>
              <span className="text-xs font-medium">{a.title}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{a.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <Star className="size-3.5" /> Hoàn thành task, thói quen, mục tiêu… để nhận thêm XP và mở khoá huy hiệu.
      </p>
    </div>
  );
}
