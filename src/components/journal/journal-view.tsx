"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/tracker/delete-button";
import { saveJournalEntry } from "@/server/actions/journal";
import { cn } from "@/lib/utils";

type Entry = { id: string; dateKey: string; content: string; mood: number | null };

const moods = ["😞", "😕", "😐", "🙂", "😄"];
const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function todayKey() {
  const t = new Date();
  return keyOf(t.getFullYear(), t.getMonth(), t.getDate());
}

export function JournalView({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const byDay = useMemo(() => new Map(entries.map((e) => [e.dateKey, e])), [entries]);

  const [selected, setSelected] = useState(todayKey());
  const [view, setView] = useState(() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; });
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(0);
  const [saving, setSaving] = useState(false);

  // Load the selected day's entry into the composer.
  useEffect(() => {
    const e = byDay.get(selected);
    setContent(e?.content ?? "");
    setMood(e?.mood ?? 0);
  }, [selected, byDay]);

  async function save() {
    if (!content.trim() || saving) return;
    setSaving(true);
    await saveJournalEntry({ date: selected, content, mood: mood || undefined });
    setSaving(false);
    router.refresh();
  }

  // Build the month grid (Monday-start).
  const first = new Date(view.y, view.m, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthName = new Date(view.y, view.m, 1).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const move = (delta: number) => setView((v) => {
    const d = new Date(v.y, v.m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const selectedLabel = new Date(`${selected}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const monthEntries = entries.filter((e) => e.dateKey.startsWith(`${view.y}-${pad(view.m + 1)}`)).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* Calendar */}
      <Card>
        <CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => move(-1)} className="grid size-7 place-items-center rounded-lg hover:bg-accent"><ChevronLeft className="size-4" /></button>
            <span className="text-sm font-medium capitalize">{monthName}</span>
            <button onClick={() => move(1)} className="grid size-7 place-items-center rounded-lg hover:bg-accent"><ChevronRight className="size-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((w) => <span key={w} className="py-1 text-[10px] font-medium text-muted-foreground">{w}</span>)}
            {cells.map((d, i) => {
              if (d === null) return <span key={i} />;
              const k = keyOf(view.y, view.m, d);
              const has = byDay.has(k);
              const isSel = k === selected;
              const isToday = k === todayKey();
              return (
                <button
                  key={i}
                  onClick={() => setSelected(k)}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-lg text-sm transition-colors",
                    isSel ? "bg-primary text-primary-foreground" : "hover:bg-accent/50",
                    !isSel && isToday && "ring-1 ring-primary/50",
                  )}
                >
                  {d}
                  {has && !isSel && <span className="absolute bottom-1 size-1 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Composer + month list */}
      <div className="space-y-5">
        <Card>
          <CardContent className="pt-5">
            <p className="mb-3 text-sm font-medium capitalize">{selectedLabel}</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hôm đó của bạn thế nào?"
              rows={6}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1.5">
                <span className="mr-1 text-xs text-muted-foreground">Tâm trạng:</span>
                {moods.map((m, i) => (
                  <button key={i} onClick={() => setMood(i + 1)}
                    className={cn("grid size-8 place-items-center rounded-lg text-lg transition-all", mood === i + 1 ? "scale-110 bg-primary/15 ring-1 ring-primary/40" : "opacity-50 hover:opacity-100")}>
                    {m}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={save} disabled={!content.trim() || saving} className="gap-1.5">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Lưu
              </Button>
            </div>
          </CardContent>
        </Card>

        {monthEntries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bài trong tháng ({monthEntries.length})</p>
            {monthEntries.map((e) => (
              <Card key={e.id}>
                <CardContent className="pt-4">
                  <button onClick={() => setSelected(e.dateKey)} className="flex w-full items-center gap-2 text-left">
                    {e.mood && <span className="text-base">{moods[e.mood - 1]}</span>}
                    <span className="text-sm font-medium">{new Date(`${e.dateKey}T00:00:00`).toLocaleDateString("vi-VN", { day: "numeric", month: "long" })}</span>
                    <span className="ml-auto"><DeleteButton type="journal" id={e.id} /></span>
                  </button>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
