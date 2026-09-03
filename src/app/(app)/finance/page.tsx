import { TrendingUp, PiggyBank, ArrowDownLeft, ArrowUpRight, Wallet, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Donut } from "@/components/charts/donut";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { AddTransaction } from "@/components/finance/add-transaction";
import { BudgetManager } from "@/components/finance/budget-manager";
import { TxDelete } from "@/components/finance/tx-delete";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney, cn } from "@/lib/utils";
import { localeFor, currencySymbol } from "@/lib/settings-config";
import { ensureUser } from "@/server/services/user.service";
import { financeService } from "@/server/services/finance.service";

export const metadata = { title: "Finance — LIFE OS" };

const palette = ["#f59e0b", "#8b5cf6", "#38bdf8", "#f472b6", "#22c55e", "#94a3b8", "#fb923c"];
const emptySummary = { income: 0, expense: 0, netWorth: 0, savingsRate: 0, byCategory: [] as { category: string; amount: number }[] };

export default async function FinancePage() {
  const user = await ensureUser();

  const [summary, txns, accounts, series, budgets] = user
    ? await Promise.all([
        financeService.summary(user.id),
        financeService.list(user.id, 30),
        financeService.accounts(user.id),
        financeService.monthlySeries(user.id, 6),
        financeService.budgets(user.id),
      ])
    : [emptySummary, [], [], [], []];

  const currency = user?.settings?.currency ?? "VND";
  const locale = localeFor[user?.settings?.language ?? "vi"] ?? "vi-VN";
  const money = (n: number) => formatMoney(n, currency, locale);

  const byCategory = summary.byCategory.map((c, i) => ({ ...c, color: palette[i % palette.length] }));
  const hasData = txns.length > 0 || accounts.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground">Dòng tiền, chi tiêu & tài sản.</p>
        </div>
        <AddTransaction currency={currencySymbol[currency]} accounts={accounts.map((a) => ({ id: a.id, name: a.name }))} />
      </div>

      {/* Summary hero */}
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-emerald-500/15 blur-3xl" />
        <CardContent className="flex flex-wrap items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-sm text-muted-foreground">Tài sản ròng</p>
            <p className="mt-1 text-4xl font-semibold tracking-tight">{money(summary.netWorth)}</p>
          </div>
          <div className="flex gap-6">
            <Stat label="Thu (tháng này)" value={money(summary.income)} accent="text-emerald-400" icon={ArrowDownLeft} />
            <Stat label="Chi (tháng này)" value={money(summary.expense)} accent="text-red-400" icon={ArrowUpRight} />
            <Stat label="Tiết kiệm" value={`${summary.savingsRate}%`} accent="text-primary" icon={PiggyBank} />
          </div>
        </CardContent>
      </Card>

      {!hasData ? (
        <EmptyState
          icon={Wallet}
          title="Chưa có giao dịch nào"
          description="Thêm khoản thu/chi đầu tiên bằng nút “+ Giao dịch” ở trên."
        />
      ) : (
       <>
        {/* Cashflow + budgets */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Dòng tiền 6 tháng</CardTitle>
            </CardHeader>
            <CardContent><CashflowChart data={series} currency={currency} locale={locale} /></CardContent>
          </Card>
          <BudgetManager budgets={budgets} currency={currency} locale={locale} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Spending donut */}
          {byCategory.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Chi tiêu theo danh mục</CardTitle></CardHeader>
              <CardContent>
                <Donut data={byCategory} />
                <div className="mt-3 space-y-1.5">
                  {byCategory.slice(0, 5).map((c) => (
                    <div key={c.category} className="flex items-center gap-2 text-xs">
                      <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                      <span className="flex-1 text-muted-foreground">{c.category}</span>
                      <span className="tabular-nums">{money(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accounts */}
          <Card>
            <CardHeader><CardTitle>Tài khoản</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {accounts.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Chưa có tài khoản.</p>
              ) : accounts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><Wallet className="size-4" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">{a.kind}</p>
                  </div>
                  <span className={cn("text-sm font-medium tabular-nums", Number(a.balance) < 0 && "text-red-400")}>
                    {money(Number(a.balance))}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Giao dịch gần đây</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {txns.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <Receipt className="size-6" />
                  <p className="mt-2 text-sm">Chưa có giao dịch.</p>
                </div>
              ) : txns.map((t) => {
                const income = t.type === "INCOME";
                return (
                  <div key={t.id} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/30">
                    <span className={cn("grid size-8 place-items-center rounded-full", income ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
                      {income ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{t.note || t.category}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(t.date).toLocaleDateString(locale, { day: "numeric", month: "numeric" })} · {t.category}</p>
                    </div>
                    <span className={cn("text-sm font-medium tabular-nums", income ? "text-emerald-400" : "text-foreground")}>
                      {income ? "+" : "−"}{money(Number(t.amount))}
                    </span>
                    <TxDelete id={t.id} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
       </>
      )}
    </div>
  );
}

function Stat({ label, value, accent, icon: Icon }: { label: string; value: string; accent: string; icon: typeof TrendingUp }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Icon className={cn("size-3.5", accent)} /> {label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
