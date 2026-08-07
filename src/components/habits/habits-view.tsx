"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Repeat, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/stores/ui-store";
import { toggleHabitToday } from "@/server/actions/habit";
import { cn, pct } from "@/lib/utils";

type Habit = { id: string; name: string; emoji: string | null; color: string; doneToday: boolean };

export function HabitsView({ habits }: { habits: Habit[] }) {
  const router = useRouter();
  const { openQuickAdd } = useUIStore();
  const [busy, setBusy] = useState<string | null>(null);
  const done = habits.filter((h) => h.doneToday).length;

  async function toggle(id: string) {
    setBusy(id);
    await toggleHabitToday(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground">Xây kỷ luật mỗi ngày.</p>
        </div>
        <Button className="gap-1.5" onClick={() => openQuickAdd("habit")}>
          <Plus className="size-4" /> Thói quen mới
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Chưa có thói quen nào"
          description="Bắt đầu với 1–3 thói quen nhỏ để xây kỷ luật mỗi ngày."
          action={<Button onClick={() => openQuickAdd("habit")}><Plus className="size-4" /> Thêm thói quen</Button>}
        />
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Hôm nay</CardTitle>
            <span className="text-xs text-muted-foreground">{done}/{habits.length} · {pct(done, habits.length)}%</span>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={pct(done, habits.length)} indicatorClassName="bg-emerald-500" className="mb-3" />
            {habits.map((h) => (
              <button
                key={h.id}
                onClick={() => toggle(h.id)}
                disabled={busy === h.id}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                  h.doneToday ? "bg-accent/40" : "hover:bg-accent/30",
                )}
              >
                <span
                  className={cn("grid size-8 place-items-center rounded-lg border transition-all", h.doneToday ? "border-transparent text-white" : "border-border")}
                  style={h.doneToday ? { background: h.color } : undefined}
                >
                  {h.doneToday ? <Check className="size-4" /> : <span className="text-base">{h.emoji}</span>}
                </span>
                <span className={cn("flex-1 text-sm", h.doneToday && "text-muted-foreground line-through")}>{h.name}</span>
                {h.doneToday && <Flame className="size-4 text-amber-400" />}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
