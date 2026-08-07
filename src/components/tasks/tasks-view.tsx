"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Clock, Plus, CheckSquare, ChevronDown, Trash2, Loader2, X, CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  toggleTaskDone, deleteTask, createTask, addSubtask, toggleSubtask, removeSubtask,
} from "@/server/actions/task";
import { cn } from "@/lib/utils";

type Subtask = { id: string; title: string; done: boolean };
type Task = {
  id: string; title: string; status: string; priority: string;
  dueDate: Date | string | null; description?: string | null;
  project?: { name: string } | null; subtasks?: Subtask[];
};

const priorities = [
  { key: "NONE", label: "—", dot: "bg-muted-foreground/40" },
  { key: "LOW", label: "Thấp", dot: "bg-sky-500" },
  { key: "MEDIUM", label: "TB", dot: "bg-amber-500" },
  { key: "HIGH", label: "Cao", dot: "bg-orange-500" },
  { key: "URGENT", label: "Gấp", dot: "bg-red-500" },
];
const dotOf: Record<string, string> = Object.fromEntries(priorities.map((p) => [p.key, p.dot]));

const views = [
  { key: "all", label: "Tất cả" },
  { key: "today", label: "Hôm nay" },
  { key: "upcoming", label: "Sắp tới" },
];

function isToday(d: Date) {
  const t = new Date(); return d.toDateString() === t.toDateString();
}

export function TasksView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [view, setView] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // New-task form
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("NONE");
  const [due, setDue] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = () => router.refresh();

  async function create() {
    if (!title.trim()) return;
    setCreating(true);
    await createTask({ title: title.trim(), priority, ...(due ? { dueDate: due } : {}) });
    setCreating(false);
    setTitle(""); setPriority("NONE"); setDue("");
    refresh();
  }

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id); await fn(); setBusy(null); refresh();
  }

  const filtered = tasks.filter((t) => {
    if (view === "all") return true;
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    if (view === "today") return isToday(d);
    if (view === "upcoming") return d > new Date();
    return true;
  });
  const active = filtered.filter((t) => t.status !== "DONE" && t.status !== "CANCELED");
  const done = filtered.filter((t) => t.status === "DONE");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">{active.length} việc cần làm</p>
      </div>

      {/* New task form */}
      <Card>
        <CardContent className="space-y-3 pt-5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="Việc cần làm…"
            className="h-11"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {priorities.map((p) => (
                <button key={p.key} onClick={() => setPriority(p.key)}
                  className={cn("flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors",
                    priority === p.key ? "border-primary/50 bg-primary/10" : "border-border text-muted-foreground hover:bg-accent/40")}>
                  <span className={cn("size-1.5 rounded-full", p.dot)} /> {p.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
                className="h-8 rounded-lg border border-border bg-transparent pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <Button size="sm" className="ml-auto gap-1.5" onClick={create} disabled={!title.trim() || creating}>
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Thêm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View tabs */}
      <div className="glass ring-hairline flex gap-1 rounded-xl p-1">
        {views.map((v) => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={cn("flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
              view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50")}>
            {v.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Không có task" description="Thêm việc mới ở trên hoặc đổi bộ lọc." />
      ) : (
        <Card>
          <CardContent className="space-y-1 pt-5">
            {active.map((t) => (
              <TaskRow key={t.id} task={t} busy={busy === t.id}
                expanded={expanded === t.id} onExpand={() => setExpanded(expanded === t.id ? null : t.id)}
                onToggle={() => run(t.id, () => toggleTaskDone(t.id))}
                onDelete={() => run(t.id, () => deleteTask(t.id))}
                onAddSub={(title) => run(t.id, () => addSubtask(t.id, title))}
                onToggleSub={(sid) => run(sid, () => toggleSubtask(sid))}
                onRemoveSub={(sid) => run(sid, () => removeSubtask(sid))} />
            ))}
            {done.length > 0 && (
              <div className="pt-3">
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Hoàn thành ({done.length})</p>
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} busy={busy === t.id} expanded={false} onExpand={() => {}}
                    onToggle={() => run(t.id, () => toggleTaskDone(t.id))}
                    onDelete={() => run(t.id, () => deleteTask(t.id))}
                    onAddSub={() => {}} onToggleSub={() => {}} onRemoveSub={() => {}} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskRow({
  task, busy, expanded, onExpand, onToggle, onDelete, onAddSub, onToggleSub, onRemoveSub,
}: {
  task: Task; busy: boolean; expanded: boolean; onExpand: () => void;
  onToggle: () => void; onDelete: () => void;
  onAddSub: (title: string) => void; onToggleSub: (id: string) => void; onRemoveSub: (id: string) => void;
}) {
  const [subInput, setSubInput] = useState("");
  const isDone = task.status === "DONE";
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const subs = task.subtasks ?? [];
  const subsDone = subs.filter((s) => s.done).length;

  return (
    <div className="rounded-xl transition-colors hover:bg-accent/20">
      <div className="group flex items-center gap-3 px-2 py-2.5">
        <button onClick={onToggle} disabled={busy}
          className={cn("grid size-5 shrink-0 place-items-center rounded-md border transition-all",
            isDone ? "border-transparent bg-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary")}>
          {isDone && <Check className="size-3.5" />}
        </button>
        <span className={cn("size-1.5 shrink-0 rounded-full", dotOf[task.priority])} />
        <button onClick={onExpand} className={cn("flex-1 truncate text-left text-sm", isDone && "text-muted-foreground line-through")}>
          {task.title}
        </button>
        {subs.length > 0 && <span className="text-[11px] text-muted-foreground">{subsDone}/{subs.length}</span>}
        {due && (
          <span className={cn("hidden items-center gap-1 text-xs sm:flex", due < new Date() && !isDone ? "text-red-400" : "text-muted-foreground")}>
            <Clock className="size-3" /> {due.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
          </span>
        )}
        <button onClick={onExpand} className="text-muted-foreground">
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
        </button>
        <button onClick={onDelete} disabled={busy} className="opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-1.5 border-t border-border/60 px-9 py-2.5">
          {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
          {subs.map((s) => (
            <div key={s.id} className="group/sub flex items-center gap-2">
              <button onClick={() => onToggleSub(s.id)}
                className={cn("grid size-4 place-items-center rounded border transition-all", s.done ? "border-transparent bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
                {s.done && <Check className="size-3" />}
              </button>
              <span className={cn("flex-1 text-sm", s.done && "text-muted-foreground line-through")}>{s.title}</span>
              <button onClick={() => onRemoveSub(s.id)} className="opacity-0 group-hover/sub:opacity-100">
                <X className="size-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input value={subInput} onChange={(e) => setSubInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && subInput.trim()) { onAddSub(subInput.trim()); setSubInput(""); } }}
              placeholder="+ Việc con…"
              className="flex-1 border-b border-border bg-transparent pb-1 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
