"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney, cn } from "@/lib/utils";
import { createAccount, updateAccount, deleteAccount } from "@/server/actions/account";

type Account = { id: string; name: string; kind: string; balance: number };

export const kinds = [
  { key: "cash", label: "Tiền mặt", emoji: "💵" },
  { key: "bank", label: "Ngân hàng", emoji: "🏦" },
  { key: "savings", label: "Tiết kiệm", emoji: "🐷" },
  { key: "investment", label: "Đầu tư", emoji: "📈" },
  { key: "ewallet", label: "Ví điện tử", emoji: "📱" },
  { key: "credit", label: "Thẻ tín dụng", emoji: "💳" },
];
const kindMap = Object.fromEntries(kinds.map((k) => [k.key, k]));

export function AccountsManager({ accounts, currency = "VND", locale = "vi-VN" }: { accounts: Account[]; currency?: string; locale?: string }) {
  const router = useRouter();
  const money = (n: number) => formatMoney(n, currency, locale);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("bank");
  const [balance, setBalance] = useState("");
  const [busy, setBusy] = useState(false);

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const run = async (fn: () => Promise<unknown>) => { setBusy(true); await fn(); setBusy(false); router.refresh(); };

  async function add() {
    if (!name.trim()) return;
    await run(() => createAccount({ name: name.trim(), kind, balance: Number(balance) || 0 }));
    setName(""); setBalance(""); setKind("bank");
  }

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-emerald-500/15 blur-3xl" />
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">Tổng tài sản</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{money(total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{accounts.length} tài khoản</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nơi để tiền</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {accounts.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Chưa có tài khoản — thêm ở dưới.</p>}
          {accounts.map((a) => {
            const k = kindMap[a.kind] ?? { emoji: "💰", label: a.kind };
            return (
              <div key={a.id} className="group flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-lg">{k.emoji}</span>
                <div className="min-w-0 flex-1">
                  <Input defaultValue={a.name} onBlur={(e) => e.target.value !== a.name && run(() => updateAccount(a.id, { name: e.target.value }))}
                    className="h-8 border-0 px-0 font-medium focus:ring-0" />
                  <p className="text-[11px] text-muted-foreground">{k.label}</p>
                </div>
                <div className="text-right">
                  <Input defaultValue={a.balance} inputMode="numeric" onBlur={(e) => Number(e.target.value.replace(/\D/g, "")) !== a.balance && run(() => updateAccount(a.id, { balance: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
                    className={cn("h-8 w-32 border-0 px-0 text-right font-medium tabular-nums focus:ring-0", a.balance < 0 && "text-red-400")} />
                  <p className="text-[10px] text-muted-foreground">{currency}</p>
                </div>
                <button onClick={() => run(() => deleteAccount(a.id))} className="opacity-0 group-hover:opacity-100">
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            );
          })}

          {/* Add account */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên tài khoản" className="h-9 min-w-[120px] flex-1" />
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 rounded-lg border border-border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring">
              {kinds.map((k) => <option key={k.key} value={k.key} className="bg-background">{k.emoji} {k.label}</option>)}
            </select>
            <Input value={balance} onChange={(e) => setBalance(e.target.value.replace(/[^\d-]/g, ""))} inputMode="numeric" placeholder="Số dư" className="h-9 w-28" />
            <Button size="sm" onClick={add} disabled={!name.trim() || busy} className="gap-1.5">{busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Thêm</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
