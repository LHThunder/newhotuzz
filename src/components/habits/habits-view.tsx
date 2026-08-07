"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Repeat, Flame, Trash2, Loader2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { createHabit, deleteHabit, toggleHabitOnDate } from "@/server/actions/habit";
import { cn } from "@/lib/utils";

type Day = { key: string; done: boolean; label: string };
type Habit = {
  id: string; name: string; emoji: string | null; color: string;
  doneToday: boolean; streak: number; completion: number; last7: Day[];
};

const emojiChoices = ["✅", "🧘", "📚", "💪", "💧", "🏃", "🌙", "✍️", "🥗", "🎯", "🧠", "☀️"];
const colorChoices = ["#22c55e", "#38bdf8", "#a78bfa", "#f472b6", "#fb923c", "#f59e0b", "#22d3ee", "#818cf8"];

export function HabitsView({ habits }: { habits: Habit[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("✅");
  const [color, setColor] = useState("#22c55e");
  const [creating, setCreating] = useState(false);

  const doneToday = habits.filter((h) => h.doneToday).length;
  const bestStreak = habits.length ? Math.max(...habits.map((h) => h.streak)) : 0;

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id); await fn(); setBusy(null); router.refresh();
  }

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    await createHabit({ name: name.trim(), emoji, color });
    setCreating(false);
    setName(""); setEmoji("✅"); setColor("#22c55e"); setAdding(false);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground">Xây kỷ luật mỗi ngày.</p>
        </div>
        <Button className="gap-1.5" onClick={() => setAdding(!adding)}>
          <Plus className="size-4" /> Thói quen mới
        </Button>
      </div>

      {/* Stats */}
      {habits.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Hôm nay" value={`${doneToday}/${habits.length}`} />
          <Stat label="Streak dài nhất" value={`${bestStreak}`} icon />
          <Stat label="Tổng thói quen" value={`${habits.length}`} />
        </div>
      )}

      {/* Add form */}
      {adding && (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Tên thói quen…" className="h-11" autoFocus />
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Biểu tượng</p>
              <div className="flex flex-wrap gap-1.5">
                {emojiChoices.map((e) => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className={cn("grid size-9 place-items-center rounded-lg text-lg transition-all", emoji === e ? "bg-primary/15 ring-1 ring-primary/40" : "hover:bg-accent/50")}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Màu</p>
              <div className="flex flex-wrap gap-2">
                {colorChoices.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={cn("size-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all", color === c ? "ring-foreground/40 scale-110" : "ring-transparent")}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>Huỷ</Button>
              <Button size="sm" onClick={create} disabled={!name.trim() || creating}>
                {creating && <Loader2 className="size-4 animate-spin" />} Tạo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {habits.length === 0 && !adding ? (
        <EmptyState icon={Repeat} title="Chưa có thói quen nào" description="Bắt đầu với 1–3 thói quen nhỏ."
          action={<Button onClick={() => setAdding(true)}><Plus className="size-4" /> Thêm thói quen</Button>} />
      ) : (
        <Card>
          <CardHeader><CardTitle>Tuần này</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {habits.map((h) => (
              <div key={h.id} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-accent/20">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg text-lg" style={{ background: `${h.color}22` }}>{h.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h.name}</p>
                  <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-0.5 text-amber-400"><Flame className="size-3" /> {h.streak}</span>
                    <span>· {h.completion}% (30 ngày)</span>
                  </p>
                </div>
                {/* Last 7 days grid */}
                <div className="flex gap-1">
                  {h.last7.map((d) => (
                    <button key={d.key} onClick={() => run(h.id + d.key, () => toggleHabitOnDate(h.id, d.key))} title={d.key}
                      className={cn("grid size-6 place-items-center rounded-md border text-[9px] transition-all", d.done ? "border-transparent text-white" : "border-border text-muted-foreground/50")}
                      style={d.done ? { background: h.color } : undefined}>
                      {d.done ? <Check className="size-3" /> : d.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => run(h.id, () => deleteHabit(h.id))} disabled={busy === h.id}
                  className="opacity-0 transition-opacity group-hover:opacity-100">
                  {busy === h.id ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1 text-lg font-semibold tabular-nums">
        {icon && <Flame className="size-4 text-amber-400" />} {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
