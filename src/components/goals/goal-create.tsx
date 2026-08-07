"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGoal } from "@/server/actions/goal";
import { cn } from "@/lib/utils";

const horizons = [
  { key: "YEAR", label: "Năm" },
  { key: "QUARTER", label: "Quý" },
  { key: "MONTH", label: "Tháng" },
  { key: "WEEK", label: "Tuần" },
  { key: "VISION", label: "Tầm nhìn" },
];

export function GoalCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [horizon, setHorizon] = useState("YEAR");
  const [deadline, setDeadline] = useState("");
  const [pending, setPending] = useState(false);

  async function create() {
    if (!title.trim()) return;
    setPending(true);
    await createGoal({ title: title.trim(), horizon, ...(deadline ? { deadline } : {}) });
    setPending(false);
    setTitle(""); setDeadline(""); setHorizon("YEAR"); setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground">Từ tầm nhìn đến hành động mỗi ngày.</p>
      </div>
      <Button className="gap-1.5" onClick={() => setOpen(!open)}>
        <Plus className="size-4" /> Mục tiêu mới
      </Button>

      {open && (
        <Card className="w-full">
          <CardContent className="space-y-3 pt-5">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Mục tiêu của bạn…" className="h-11" autoFocus />
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {horizons.map((h) => (
                  <button key={h.key} onClick={() => setHorizon(h.key)}
                    className={cn("rounded-lg border px-2.5 py-1 text-xs transition-colors", horizon === h.key ? "border-primary/50 bg-primary/10" : "border-border text-muted-foreground hover:bg-accent/40")}>
                    {h.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="h-8 rounded-lg border border-border bg-transparent pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button size="sm" className="ml-auto" onClick={create} disabled={!title.trim() || pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Tạo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
