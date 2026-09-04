import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { formatMoney, cn } from "@/lib/utils";

type Period = {
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
  byCategory: { category: string; amount: number }[];
};
type Series = { month: string; income: number; expense: number }[];

export function ReportsView({
  month, year, series, currency, locale,
}: { month: Period; year: Period; series: Series; currency: string; locale: string }) {
  const money = (n: number) => formatMoney(n, currency, locale);
  const activeMonths = series.filter((s) => s.income || s.expense).length || 1;
  const avgExpense = Math.round(year.expense / activeMonths);
  const avgIncome = Math.round(year.income / activeMonths);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <PeriodCard title="Tháng này" period={month} money={money} />
        <PeriodCard title="Năm nay" period={year} money={money} />
      </div>

      <Card>
        <CardHeader><CardTitle>So sánh thu / chi 12 tháng</CardTitle></CardHeader>
        <CardContent><CashflowChart data={series} currency={currency} locale={locale} /></CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Thu TB / tháng" value={money(avgIncome)} accent="text-emerald-400" icon={ArrowDownLeft} />
        <MiniStat label="Chi TB / tháng" value={money(avgExpense)} accent="text-red-400" icon={ArrowUpRight} />
        <MiniStat label="Tỷ lệ tiết kiệm (năm)" value={`${year.savingsRate}%`} accent="text-primary" icon={PiggyBank} />
      </div>
    </div>
  );
}

function PeriodCard({ title, period, money }: { title: string; period: Period; money: (n: number) => string }) {
  const top = period.byCategory.slice(0, 5);
  const max = top[0]?.amount || 1;
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", period.savings >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
          {period.savings >= 0 ? "Dư" : "Âm"} {money(Math.abs(period.savings))}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Box label="Thu" value={money(period.income)} accent="text-emerald-400" />
          <Box label="Chi" value={money(period.expense)} accent="text-red-400" />
          <Box label="Tiết kiệm" value={`${period.savingsRate}%`} accent="text-primary" />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Chi nhiều nhất</p>
          {top.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted-foreground">Chưa có chi tiêu.</p>
          ) : (
            <div className="space-y-2">
              {top.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{c.category}</span>
                    <span className="tabular-nums">{money(c.amount)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${(c.amount / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Box({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-border p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", accent)}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value, accent, icon: Icon }: { label: string; value: string; accent: string; icon: typeof TrendingUp }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <span className={cn("grid size-10 place-items-center rounded-xl bg-muted", accent)}><Icon className="size-5" /></span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
