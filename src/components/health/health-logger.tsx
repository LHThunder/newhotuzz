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

export function HealthLogger({ waterMl, waterGoal }: { waterMl: number; waterGoal: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");

  async function log(kind: "water" | "weight" | "steps", value: number) {
    setBusy(true);
    await logHealth({ kind, value });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Water */}
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

      {/* Weight */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="size-4 text-violet-400" /> Cân nặng</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ""))} placeholder="kg" />
          <Button size="sm" variant="glass" className="w-full" disabled={busy || !weight} onClick={() => { log("weight", Number(weight)); setWeight(""); }}>
            Ghi lại
          </Button>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Footprints className="size-4 text-emerald-400" /> Số bước</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input inputMode="numeric" value={steps} onChange={(e) => setSteps(e.target.value.replace(/\D/g, ""))} placeholder="bước" />
          <Button size="sm" variant="glass" className="w-full" disabled={busy || !steps} onClick={() => { log("steps", Number(steps)); setSteps(""); }}>
            Ghi lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
