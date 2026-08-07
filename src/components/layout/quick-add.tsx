"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, Repeat, BookOpen, Target, X, Loader2 } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createTask } from "@/server/actions/task";
import { createHabit } from "@/server/actions/habit";
import { createGoal } from "@/server/actions/goal";
import { createNote } from "@/server/actions/note";

const kinds = [
  { key: "task", label: "Task", icon: CheckSquare, accent: "--accent-task" },
  { key: "habit", label: "Habit", icon: Repeat, accent: "--accent-habit" },
  { key: "goal", label: "Goal", icon: Target, accent: "--accent-goal" },
  { key: "note", label: "Note", icon: BookOpen, accent: "--accent-brain" },
];

export function QuickAdd() {
  const router = useRouter();
  const { quickAddOpen, setQuickAddOpen, quickAddKind } = useUIStore();
  const [kind, setKind] = useState<string>(quickAddKind);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quickAddOpen) setKind(quickAddKind);
  }, [quickAddOpen, quickAddKind]);

  const submit = async () => {
    const title = value.trim();
    if (!title) return;
    setPending(true);
    setError(null);

    const res =
      kind === "task" ? await createTask({ title })
      : kind === "habit" ? await createHabit({ name: title })
      : kind === "goal" ? await createGoal({ title })
      : await createNote({ title });

    setPending(false);
    if (res && !res.ok) { setError(res.error); return; }
    setValue("");
    setQuickAddOpen(false);
    router.refresh();
  };

  return (
    <AnimatePresence>
      {quickAddOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[18vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickAddOpen(false)}
        >
          <motion.div
            className="glass-strong ring-hairline w-full max-w-lg overflow-hidden rounded-2xl shadow-glass"
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Thêm nhanh</p>
              <button onClick={() => setQuickAddOpen(false)}>
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex gap-2 p-3">
              {kinds.map((k) => (
                <button
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors",
                    kind === k.key
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent/50",
                  )}
                >
                  <k.icon className="size-4" style={{ color: `hsl(var(${k.accent}))` }} />
                  {k.label}
                </button>
              ))}
            </div>

            <div className="px-3 pb-3">
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={`Nội dung ${kind}…  (Enter để lưu)`}
                className="w-full rounded-xl border border-border bg-transparent px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setQuickAddOpen(false)}>
                  Huỷ
                </Button>
                <Button size="sm" onClick={submit} disabled={!value.trim() || pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />} Lưu
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
