"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Calendar, FolderKanban, ChevronDown, Trash2, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Ring } from "@/components/charts/ring";
import { Badge } from "@/components/ui/badge";
import { toggleMilestone, addMilestone, deleteMilestone, deleteGoal, setGoalProject } from "@/server/actions/goal";
import { cn } from "@/lib/utils";

type Milestone = { id: string; title: string; done: boolean };
type Goal = {
  id: string; title: string; horizon: string; progress: number;
  deadline: Date | string | null; project?: { name: string } | null; milestones: Milestone[];
  fromProject?: boolean;
};

const horizonLabel: Record<string, string> = {
  VISION: "Tầm nhìn", LIFE: "Cuộc đời", YEAR: "Năm", QUARTER: "Quý", MONTH: "Tháng", WEEK: "Tuần", DAY: "Ngày",
};
const horizonColor: Record<string, string> = {
  YEAR: "--accent-goal", QUARTER: "--accent-learning", MONTH: "--accent-task",
  WEEK: "--accent-habit", DAY: "--accent-health", VISION: "--accent-brain", LIFE: "--accent-brain",
};

export function GoalCard({
  goal, delay = 0, projects = [], projectId = null,
}: {
  goal: Goal; delay?: number; projects?: { id: string; name: string }[]; projectId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msInput, setMsInput] = useState("");

  const color = horizonColor[goal.horizon] ?? "--primary";
  const deadline = goal.deadline ? new Date(goal.deadline).toLocaleDateString("vi-VN") : null;
  const done = goal.milestones.filter((m) => m.done).length;

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id); await fn(); setBusy(null); router.refresh();
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
                {deadline && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Calendar className="size-3" /> {deadline}</span>}
              </div>
              <h3 className="mt-1.5 font-semibold leading-tight">{goal.title}</h3>
              {goal.project && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  <FolderKanban className="size-3" /> {goal.project.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setOpen(!open)} className="text-muted-foreground">
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
              <button onClick={() => run("goal", () => deleteGoal(goal.id))} disabled={busy === "goal"}>
                {busy === "goal" ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />}
              </button>
            </div>
          </div>

          {open && (
            <div className="mt-4 space-y-1 border-t border-border pt-3">
              {projects.length > 0 && (
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Dự án liên kết {goal.fromProject && <span className="text-primary">· tiến độ tự tính từ task của dự án</span>}
                  </label>
                  <select
                    value={projectId ?? ""}
                    onChange={(e) => run("proj", () => setGoalProject(goal.id, e.target.value || null))}
                    className="h-8 w-full rounded-lg border border-border bg-transparent px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" className="bg-background">Không (dùng milestone)</option>
                    {projects.map((p) => <option key={p.id} value={p.id} className="bg-background">{p.name}</option>)}
                  </select>
                </div>
              )}
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Milestones · {done}/{goal.milestones.length}</p>
              {goal.milestones.map((m) => (
                <div key={m.id} className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-accent/20">
                  <button onClick={() => run(m.id, () => toggleMilestone(m.id))} disabled={busy === m.id}
                    className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition-all", m.done ? "border-transparent text-white" : "border-muted-foreground/40")}
                    style={m.done ? { background: `hsl(var(${color}))` } : undefined}>
                    {m.done && <Check className="size-3.5" />}
                  </button>
                  <span className={cn("flex-1 text-sm", m.done && "text-muted-foreground line-through")}>{m.title}</span>
                  <button onClick={() => run(m.id, () => deleteMilestone(m.id))} className="opacity-0 group-hover:opacity-100">
                    <X className="size-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
              <input
                value={msInput}
                onChange={(e) => setMsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && msInput.trim()) { run("add", () => addMilestone(goal.id, msInput.trim())); setMsInput(""); } }}
                placeholder="+ Thêm milestone…"
                className="mt-1 w-full border-b border-border bg-transparent px-1.5 pb-1 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
