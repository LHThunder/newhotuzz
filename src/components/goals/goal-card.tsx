"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Calendar, FolderKanban, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Ring } from "@/components/charts/ring";
import { Badge } from "@/components/ui/badge";
import { toggleMilestone } from "@/server/actions/goal";
import { cn } from "@/lib/utils";

type Milestone = { id: string; title: string; done: boolean };
type Goal = {
  id: string;
  title: string;
  horizon: string;
  progress: number;
  deadline: Date | string | null;
  project?: { name: string } | null;
  milestones: Milestone[];
};

const horizonLabel: Record<string, string> = {
  VISION: "Tầm nhìn", LIFE: "Cuộc đời", YEAR: "Năm", QUARTER: "Quý",
  MONTH: "Tháng", WEEK: "Tuần", DAY: "Ngày",
};
const horizonColor: Record<string, string> = {
  YEAR: "--accent-goal", QUARTER: "--accent-learning", MONTH: "--accent-task",
  WEEK: "--accent-habit", DAY: "--accent-health", VISION: "--accent-brain", LIFE: "--accent-brain",
};

export function GoalCard({ goal, delay = 0 }: { goal: Goal; delay?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const color = horizonColor[goal.horizon] ?? "--primary";
  const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString("vi-VN") : null;

  async function toggle(id: string) {
    setBusy(id);
    await toggleMilestone(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <Ring value={goal.progress} size={64} stroke={6} color={`hsl(var(${color}))`} label={`${goal.progress}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{horizonLabel[goal.horizon]}</Badge>
                {deadline && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="size-3" /> {deadline}
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 font-semibold leading-tight">{goal.title}</h3>
              {goal.project && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  <FolderKanban className="size-3" /> {goal.project.name}
                </span>
              )}
            </div>
            {goal.milestones.length > 0 && (
              <button onClick={() => setOpen(!open)} className="text-muted-foreground">
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
            )}
          </div>

          {open && goal.milestones.length > 0 && (
            <div className="mt-4 space-y-1 border-t border-border pt-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Milestones · {goal.milestones.filter((m) => m.done).length}/{goal.milestones.length}
              </p>
              {goal.milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggle(m.id)}
                  disabled={busy === m.id}
                  className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-accent/30"
                >
                  <span
                    className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition-all", m.done ? "border-transparent text-white" : "border-muted-foreground/40")}
                    style={m.done ? { background: `hsl(var(${color}))` } : undefined}
                  >
                    {m.done && <Check className="size-3.5" />}
                  </span>
                  <span className={cn("text-sm", m.done && "text-muted-foreground line-through")}>{m.title}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
