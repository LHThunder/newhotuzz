"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Plus, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore } from "@/stores/ui-store";
import { toggleTaskDone } from "@/server/actions/task";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  project?: { name: string } | null;
};

const priorityColor: Record<string, string> = {
  URGENT: "bg-red-500", HIGH: "bg-orange-500", MEDIUM: "bg-amber-500", LOW: "bg-sky-500", NONE: "bg-muted-foreground/40",
};

export function TasksView({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const { openQuickAdd } = useUIStore();
  const [busy, setBusy] = useState<string | null>(null);

  const active = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELED");
  const done = tasks.filter((t) => t.status === "DONE");

  async function toggle(id: string) {
    setBusy(id);
    await toggleTaskDone(id);
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {active.length > 0 ? `${active.length} việc cần làm` : "Tất cả đã xong 🎉"}
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => openQuickAdd("task")}>
          <Plus className="size-4" /> Task mới
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Chưa có task nào"
          description="Thêm việc đầu tiên của bạn để bắt đầu quản lý công việc."
          action={<Button onClick={() => openQuickAdd("task")}><Plus className="size-4" /> Thêm task</Button>}
        />
      ) : (
        <Card>
          <CardContent className="space-y-1 pt-5">
            {active.map((t) => (
              <TaskRow key={t.id} task={t} busy={busy === t.id} onToggle={() => toggle(t.id)} />
            ))}
            {done.length > 0 && (
              <div className="pt-3">
                <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Hoàn thành ({done.length})</p>
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} busy={busy === t.id} onToggle={() => toggle(t.id)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TaskRow({ task, busy, onToggle }: { task: Task; busy: boolean; onToggle: () => void }) {
  const isDone = task.status === "DONE";
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }) : null;
  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent/30">
      <button
        onClick={onToggle}
        disabled={busy}
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-md border transition-all",
          isDone ? "border-transparent bg-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary",
        )}
      >
        {isDone && <Check className="size-3.5" />}
      </button>
      <span className={cn("size-1.5 shrink-0 rounded-full", priorityColor[task.priority])} />
      <span className={cn("flex-1 truncate text-sm", isDone && "text-muted-foreground line-through")}>{task.title}</span>
      {due && (
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Clock className="size-3" /> {due}
        </span>
      )}
      {task.project && (
        <span className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
          {task.project.name}
        </span>
      )}
    </div>
  );
}
