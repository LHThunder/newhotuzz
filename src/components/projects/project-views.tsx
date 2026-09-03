"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Columns3, GanttChartSquare, CalendarDays, ListTree, Plus, Loader2, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { createTask, toggleTaskDone, updateTask, deleteTask } from "@/server/actions/task";
import { cn } from "@/lib/utils";

type Task = { id: string; title: string; status: string; priority: string; startDate: string | null; dueDate: string | null };

const priorityDot: Record<string, string> = { URGENT: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-amber-500", LOW: "bg-sky-500", NONE: "bg-muted-foreground/40" };
const columns = [
  { key: "TODO", label: "Cần làm" },
  { key: "IN_PROGRESS", label: "Đang làm" },
  { key: "DONE", label: "Hoàn thành" },
];
const views = [
  { key: "board", label: "Board", icon: Columns3 },
  { key: "timeline", label: "Timeline", icon: ListTree },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "gantt", label: "Gantt", icon: GanttChartSquare },
];
const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectViews({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  const router = useRouter();
  const [view, setView] = useState("board");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("NONE");
  const [start, setStart] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => router.refresh();
  async function run(fn: () => Promise<unknown>) { setBusy(true); await fn(); setBusy(false); refresh(); }

  async function add() {
    if (!title.trim()) return;
    await run(() => createTask({ title: title.trim(), projectId, priority, status: "TODO", ...(start ? { startDate: start } : {}), ...(due ? { dueDate: due } : {}) }));
    setTitle(""); setPriority("NONE"); setStart(""); setDue("");
  }

  return (
    <div className="space-y-4">
      {/* Add task */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 pt-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Task mới…" className="h-9 min-w-[160px] flex-1" />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-9 rounded-lg border border-border bg-transparent px-2 text-xs outline-none">
            {["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => <option key={p} value={p} className="bg-background">{p}</option>)}
          </select>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">Bắt đầu <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-9 rounded-lg border border-border bg-transparent px-2 text-xs outline-none" /></label>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">Hạn <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-9 rounded-lg border border-border bg-transparent px-2 text-xs outline-none" /></label>
          <Button size="sm" onClick={add} disabled={!title.trim() || busy} className="gap-1.5">{busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Thêm</Button>
        </CardContent>
      </Card>

      {/* View switcher */}
      <div className="glass ring-hairline flex gap-1 overflow-x-auto rounded-xl p-1">
        {views.map((v) => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors", view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50")}>
            <v.icon className="size-4" /> {v.label}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={Columns3} title="Chưa có task" description="Thêm task cho dự án ở trên." />
      ) : (
        <>
          {view === "board" && <BoardView tasks={tasks} onMove={(id, status) => run(() => updateTask({ id, status }))} onDelete={(id) => run(() => deleteTask(id))} />}
          {view === "timeline" && <TimelineView tasks={tasks} onToggle={(id) => run(() => toggleTaskDone(id))} />}
          {view === "calendar" && <CalendarView tasks={tasks} />}
          {view === "gantt" && <GanttView tasks={tasks} />}
        </>
      )}
    </div>
  );
}

/* ─── Board (drag & drop) ─────────────────────────────── */
function BoardView({ tasks, onMove, onDelete }: { tasks: Task[]; onMove: (id: string, status: string) => void; onDelete: (id: string) => void }) {
  const [dragId, setDragId] = useState<string | null>(null);
  const colTasks = (key: string) => tasks.filter((t) => (key === "TODO" ? ["TODO", "BACKLOG"].includes(t.status) : t.status === key));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.key}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (dragId) { onMove(dragId, col.key); setDragId(null); } }}
          className="glass ring-hairline flex flex-col gap-2 rounded-2xl p-3"
        >
          <div className="flex items-center gap-2 px-1 pb-1 text-sm font-semibold">
            {col.label} <span className="text-xs font-normal text-muted-foreground">{colTasks(col.key).length}</span>
          </div>
          {colTasks(col.key).map((t) => (
            <div key={t.id} draggable onDragStart={() => setDragId(t.id)} onDragEnd={() => setDragId(null)}
              className="group cursor-grab rounded-xl border border-border bg-card/60 p-3 active:cursor-grabbing">
              <div className="flex items-start gap-2">
                <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", priorityDot[t.priority])} />
                <p className={cn("flex-1 text-sm", t.status === "DONE" && "text-muted-foreground line-through")}>{t.title}</p>
                <button onClick={() => onDelete(t.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></button>
              </div>
              {t.dueDate && <p className="mt-1.5 pl-3 text-[11px] text-muted-foreground">Hạn {t.dueDate}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Timeline ────────────────────────────────────────── */
function TimelineView({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  const withDate = tasks.filter((t) => t.dueDate).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  const noDate = tasks.filter((t) => !t.dueDate);
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="space-y-1 pt-5">
        {withDate.map((t) => {
          const overdue = t.dueDate! < todayKey && t.status !== "DONE";
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/20">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{new Date(`${t.dueDate}T00:00:00`).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}</span>
              <span className="relative flex-1 border-l border-border pl-3">
                <span className={cn("absolute -left-[5px] top-1.5 size-2.5 rounded-full ring-4 ring-background", overdue ? "bg-red-500" : t.status === "DONE" ? "bg-emerald-500" : "bg-primary")} />
                <button onClick={() => onToggle(t.id)} className={cn("text-sm", t.status === "DONE" && "text-muted-foreground line-through")}>{t.title}</button>
              </span>
              <span className={cn("size-1.5 rounded-full", priorityDot[t.priority])} />
            </div>
          );
        })}
        {noDate.length > 0 && (
          <div className="pt-2">
            <p className="px-2 pb-1 text-xs text-muted-foreground">Chưa có hạn ({noDate.length})</p>
            {noDate.map((t) => <p key={t.id} className="px-2 py-1 text-sm text-muted-foreground">• {t.title}</p>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Calendar ────────────────────────────────────────── */
function CalendarView({ tasks }: { tasks: Task[] }) {
  const t = new Date();
  const [view, setView] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const byDay = new Map<string, Task[]>();
  for (const task of tasks) if (task.dueDate) { const arr = byDay.get(task.dueDate) ?? []; arr.push(task); byDay.set(task.dueDate, arr); }

  const first = new Date(view.y, view.m, 1);
  const startDay = (first.getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthName = first.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  const move = (d: number) => setView((v) => { const x = new Date(v.y, v.m + d, 1); return { y: x.getFullYear(), m: x.getMonth() }; });

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => move(-1)} className="grid size-7 place-items-center rounded-lg hover:bg-accent"><ChevronLeft className="size-4" /></button>
          <span className="text-sm font-medium capitalize">{monthName}</span>
          <button onClick={() => move(1)} className="grid size-7 place-items-center rounded-lg hover:bg-accent"><ChevronRight className="size-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((w) => <span key={w} className="py-1 text-center text-[10px] font-medium text-muted-foreground">{w}</span>)}
          {cells.map((d, i) => {
            if (d === null) return <span key={i} />;
            const key = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
            const items = byDay.get(key) ?? [];
            return (
              <div key={i} className="min-h-[64px] rounded-lg border border-border/60 p-1">
                <span className="text-[11px] text-muted-foreground">{d}</span>
                <div className="mt-0.5 space-y-0.5">
                  {items.slice(0, 3).map((it) => (
                    <div key={it.id} className={cn("truncate rounded px-1 py-0.5 text-[10px]", it.status === "DONE" ? "bg-emerald-500/15 text-emerald-400 line-through" : "bg-primary/15 text-primary")}>{it.title}</div>
                  ))}
                  {items.length > 3 && <div className="text-[10px] text-muted-foreground">+{items.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Gantt ───────────────────────────────────────────── */
function GanttView({ tasks }: { tasks: Task[] }) {
  const dated = tasks.filter((t) => t.dueDate || t.startDate);
  if (dated.length === 0) return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Thêm ngày bắt đầu/hạn cho task để xem Gantt.</CardContent></Card>;

  const allDates = dated.flatMap((t) => [t.startDate, t.dueDate].filter(Boolean) as string[]);
  const min = allDates.reduce((a, b) => (a < b ? a : b));
  const max = allDates.reduce((a, b) => (a > b ? a : b));
  const start = new Date(`${min}T00:00:00Z`);
  const end = new Date(`${max}T00:00:00Z`);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const dayIdx = (d: string) => Math.round((new Date(`${d}T00:00:00Z`).getTime() - start.getTime()) / 86400000);

  return (
    <Card>
      <CardContent className="overflow-x-auto pt-5">
        <div className="min-w-[560px] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{new Date(`${min}T00:00:00`).toLocaleDateString("vi-VN")}</span>
            <span>{new Date(`${max}T00:00:00`).toLocaleDateString("vi-VN")}</span>
          </div>
          {dated.map((t) => {
            const s = t.startDate ?? t.dueDate!;
            const e = t.dueDate ?? t.startDate!;
            const left = (dayIdx(s) / totalDays) * 100;
            const width = Math.max(3, ((dayIdx(e) - dayIdx(s) + 1) / totalDays) * 100);
            return (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs">{t.title}</span>
                <div className="relative h-6 flex-1 rounded bg-muted/40">
                  <div className={cn("absolute top-1 h-4 rounded", t.status === "DONE" ? "bg-emerald-500" : "bg-primary")} style={{ left: `${left}%`, width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
