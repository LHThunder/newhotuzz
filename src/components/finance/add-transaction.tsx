"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { quickAddTransaction } from "@/server/actions/finance";

const categories = ["Ăn uống", "Nhà ở", "Di chuyển", "Giải trí", "Học tập", "Thu nhập", "Khác"];

export function AddTransaction({ currency = "₫", accounts = [] }: { currency?: string; accounts?: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Ăn uống");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!amount) return;
    setPending(true);
    await quickAddTransaction({
      type, amount: Number(amount), category, note: note || undefined,
      date, ...(accountId ? { accountId } : {}),
    });
    setPending(false);
    setOpen(false);
    setAmount("");
    setNote("");
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        + Giao dịch
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="glass-strong ring-hairline w-full max-w-md overflow-hidden rounded-2xl shadow-glass"
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Giao dịch mới</p>
                <button onClick={() => setOpen(false)}><X className="size-4 text-muted-foreground" /></button>
              </div>

              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["EXPENSE", "INCOME"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                        type === t
                          ? t === "EXPENSE"
                            ? "border-red-500/40 bg-red-500/10 text-red-400"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-border text-muted-foreground hover:bg-accent/40",
                      )}
                    >
                      {t === "EXPENSE" ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                      {t === "EXPENSE" ? "Chi tiêu" : "Thu nhập"}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Input
                    autoFocus
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className="h-14 pr-14 text-center text-2xl font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currency}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs transition-colors",
                        category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)" />

                <div className="flex gap-2">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  {accounts.length > 1 && (
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-border bg-transparent px-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                      <option value="" className="bg-background">Tài khoản mặc định</option>
                      {accounts.map((a) => <option key={a.id} value={a.id} className="bg-background">{a.name}</option>)}
                    </select>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Huỷ</Button>
                  <Button size="sm" onClick={submit} disabled={!amount || pending}>
                    {pending && <Loader2 className="size-4 animate-spin" />} Lưu giao dịch
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
