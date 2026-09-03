"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { setBudget, deleteBudget } from "@/server/actions/finance";
import { cn, formatMoney } from "@/lib/utils";

type Budget = { id: string; category: string; limit: number; spent: number };

const categories = ["Ăn uống", "Nhà ở", "Di chuyển", "Giải trí", "Học tập", "Khác"];

export function BudgetManager({ budgets, currency = "VND", locale = "vi-VN" }: { budgets: Budget[]; currency?: string; locale?: string }) {
  const router = useRouter();
  const money = (n: number) => formatMoney(n, currency, locale);
  const [category, setCategory] = useState("Ăn uống");
  const [limit, setLimit] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!limit) return;
    setBusy(true);
    await setBudget(category, Number(limit));
    setBusy(false);
    setLimit("");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    await deleteBudget(id);
    setBusy(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle>Ngân sách tháng</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((b) => {
          const p = Math.round((b.spent / b.limit) * 100);
          const over = p > 100;
          return (
            <div key={b.id} className="group">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{b.category}</span>
                <div className="flex items-center gap-2">
                  <span className={cn("tabular-nums", over ? "text-red-400" : "text-muted-foreground")}>
                    {money(b.spent)} / {money(b.limit)}
                  </span>
                  <button onClick={() => remove(b.id)} className="opacity-0 group-hover:opacity-100">
                    <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
              <Progress value={Math.min(100, p)} indicatorClassName={over ? "bg-red-500" : p > 80 ? "bg-amber-500" : "bg-emerald-500"} />
            </div>
          );
        })}

        {/* Add budget */}
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-lg border border-border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring">
            {categories.map((c) => <option key={c} value={c} className="bg-background">{c}</option>)}
          </select>
          <Input inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} placeholder="Hạn mức" className="h-9 flex-1" />
          <Button size="sm" onClick={add} disabled={!limit || busy} className="gap-1.5">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Đặt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
