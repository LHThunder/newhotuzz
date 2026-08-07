"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Plus, Scale, Footprints, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { logHealth } from "@/server/actions/health";
import { pct } from "@/lib/utils";

const otherMetrics = [
  { kind: "meditation", label: "Thiền (phút)", emoji: "🧘" },
  { kind: "calories", label: "Calo (kcal)", emoji: "🔥" },
  { kind: "heart_rate", label: "Nhịp tim (bpm)", emoji: "❤️" },
];

export function HealthLogger({ waterMl, waterGoal }: { waterMl: number; waterGoal: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");
  const [otherKind, setOtherKind] = useState("meditation");
  const [otherVal, setOtherVal] = useState("");

  async function log(kind: string, value: number) {
    setBusy(true);
    await logHealth({ kind, value });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Droplets className="size-4 text-sky-400" /> Nước</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{waterMl.toLocaleString("vi-VN")}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {waterGoal.toLocaleString("vi-VN")} ml</span></p>
            <Progress value={pct(waterMl, waterGoal)} className="mt-2 h-1.5" indicatorClassName="bg-sky-500" />
            <Button size="sm" variant="glass" className="mt-3 w-full gap-1.5" disabled={busy} onClick={() => log("water", 250)}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} 250 ml
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-4 text-violet-400" /> Cân nặng</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ""))} placeholder="kg" />
            <Button size="sm" variant="glass" className="w-full" disabled={busy || !weight} onClick={() => { log("weight", Number(weight)); setWeight(""); }}>Ghi lại</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Footprints className="size-4 text-emerald-400" /> Số bước</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input inputMode="numeric" value={steps} onChange={(e) => setSteps(e.target.value.replace(/\D/g, ""))} placeholder="bước" />
            <Button size="sm" variant="glass" className="w-full" disabled={busy || !steps} onClick={() => { log("steps", Number(steps)); setSteps(""); }}>Ghi lại</Button>
          </CardContent>
        </Card>
      </div>

      {/* Other metrics */}
      <Card>
        <CardHeader><CardTitle>Chỉ số khác</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <select value={otherKind} onChange={(e) => setOtherKind(e.target.value)}
            className="h-9 rounded-lg border border-border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            {otherMetrics.map((m) => <option key={m.kind} value={m.kind} className="bg-background">{m.emoji} {m.label}</option>)}
          </select>
          <Input inputMode="numeric" value={otherVal} onChange={(e) => setOtherVal(e.target.value.replace(/\D/g, ""))} placeholder="Giá trị" className="h-9 flex-1" />
          <Button size="sm" disabled={busy || !otherVal} onClick={() => { log(otherKind, Number(otherVal)); setOtherVal(""); }} className="gap-1.5">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Ghi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
