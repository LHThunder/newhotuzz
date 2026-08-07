"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Quote, Flame, CheckSquare, Repeat, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/charts/ring";
import { LiveClock } from "@/components/dashboard/live-clock";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { greetingFor, cn, pct } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { toggleTaskDone } from "@/server/actions/task";
import { toggleHabitToday } from "@/server/actions/habit";

type Task = { id: string; title: string; priority: string; status: string; project?: { name: string } | null };
type Habit = { id: string; name: string; emoji: string | null; color: string; doneToday: boolean };

const quotes = [
  { text: "Kỷ luật là cây cầu giữa mục tiêu và thành tựu.", author: "Jim Rohn" },
  { text: "Việc bạn làm mỗi ngày quan trọng hơn việc bạn làm thỉnh thoảng.", author: "Gretchen Rubin" },
  { text: "Bạn không cần phải giỏi để bắt đầu, nhưng phải bắt đầu để giỏi.", author: "Zig Ziglar" },
];

const priorityColor: Record<string, string> = {
  URGENT: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-amber-500", LOW: "bg-sky-500", NONE: "bg-muted-foreground/40",
};

export function MissionControl({ name, locale = "vi-VN", tasks, habits }: { name: string; locale?: string; tasks: Task[]; habits: Habit[] }) {
  const router = useRouter();
  const { openQuickAdd } = useUIStore();
  const [mood, setMood] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const today = new Date();
  const quote = quotes[today.getDate() % quotes.length];
  const dateLabel = today.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });

  const activeTasks = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELED");
  const tasksDone = tasks.length - activeTasks.length;
  const habitsDone = habits.filter((h) => h.doneToday).length;
  const totalItems = tasks.length + habits.length;
  const doneItems = tasksDone + habitsDone;
  const progress = pct(doneItems, totalItems);
  const moods = ["😞", "😕", "😐", "🙂", "😄"];

  async function toggleT(id: string) { setBusy(id); await toggleTaskDone(id); setBusy(null); router.refresh(); }
  async function toggleH(id: string) { setBusy(id); await toggleHabitToday(id); setBusy(null); router.refresh(); }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Greeting hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass ring-hairline relative overflow-hidden rounded-2xl p-6 md:p-7"
      >
        <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {greetingFor()}, <span className="text-gradient">{name}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalItems === 0
                ? "Hãy thêm việc và thói quen đầu tiên để bắt đầu."
                : `Bạn đã hoàn thành ${tasksDone}/${tasks.length} việc & ${habitsDone}/${habits.length} thói quen hôm nay.`}
            </p>
          </div>
          <div className="text-right">
            <LiveClock className="text-lg font-semibold text-foreground" showSeconds />
            <p className="text-xs text-muted-foreground">Giờ địa phương</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Quote className="size-4 shrink-0 text-primary" />
            <span className="italic">“{quote.text}”</span>
            <span className="text-xs">— {quote.author}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Tâm trạng:</span>
            {moods.map((m, i) => (
              <button key={i} onClick={() => setMood(i + 1)}
                className={cn("grid size-8 place-items-center rounded-lg text-lg transition-all", mood === i + 1 ? "scale-110 bg-primary/15 ring-1 ring-primary/40" : "opacity-50 hover:opacity-100")}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Progress ring */}
        <Card className="flex flex-col items-center justify-center py-6">
          <CardTitle className="mb-3 self-start px-5">Tiến độ hôm nay</CardTitle>
          <Ring value={progress} sublabel="Hoàn thành" />
          <div className="mt-4 flex gap-6 text-center text-xs text-muted-foreground">
            <div><p className="text-base font-semibold text-foreground">{tasksDone}/{tasks.length}</p>Tasks</div>
            <div><p className="text-base font-semibold text-foreground">{habitsDone}/{habits.length}</p>Habits</div>
          </div>
        </Card>

        {/* Priority tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Việc quan trọng hôm nay</CardTitle>
            <span className="text-xs text-muted-foreground">{activeTasks.length} còn lại</span>
          </CardHeader>
          <CardContent className="space-y-1">
            {tasks.length === 0 ? (
              <EmptyState icon={CheckSquare} title="Chưa có task" description="Thêm việc cần làm để xem ở đây."
                action={<Button size="sm" onClick={() => openQuickAdd("task")}>Thêm task</Button>} className="py-8" />
            ) : (
              activeTasks.slice(0, 6).map((t) => (
                <div key={t.id} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/30">
                  <button onClick={() => toggleT(t.id)} disabled={busy === t.id}
                    className="grid size-5 shrink-0 place-items-center rounded-md border border-muted-foreground/40 transition-all hover:border-primary" />
                  <span className={cn("size-1.5 shrink-0 rounded-full", priorityColor[t.priority])} />
                  <span className="flex-1 truncate text-sm">{t.title}</span>
                  {t.project && <span className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">{t.project.name}</span>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Habits today */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Thói quen hôm nay</CardTitle>
          {habits.length > 0 && <span className="text-xs text-muted-foreground">{habitsDone}/{habits.length}</span>}
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <EmptyState icon={Repeat} title="Chưa có thói quen" description="Xây thói quen đầu tiên để theo dõi mỗi ngày."
              action={<Button size="sm" onClick={() => openQuickAdd("habit")}>Thêm thói quen</Button>} className="py-8" />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {habits.map((h) => (
                <button key={h.id} onClick={() => toggleH(h.id)} disabled={busy === h.id}
                  className={cn("flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors", h.doneToday ? "bg-accent/40" : "hover:bg-accent/30")}>
                  <span className={cn("grid size-8 place-items-center rounded-lg border transition-all", h.doneToday ? "border-transparent text-white" : "border-border")}
                    style={h.doneToday ? { background: h.color } : undefined}>
                    {h.doneToday ? <Check className="size-4" /> : <span className="text-base">{h.emoji}</span>}
                  </span>
                  <span className={cn("flex-1 text-sm", h.doneToday && "text-muted-foreground line-through")}>{h.name}</span>
                  {h.doneToday && <Flame className="size-4 text-amber-400" />}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
