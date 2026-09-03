import { CheckSquare, Repeat, PiggyBank, BookOpen, Clapperboard, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

type Stats = {
  tasksDone: number; habitRate: number; income: number; expense: number;
  savings: number; booksFinished: number; moviesWatched: number;
};

export function StatsGrid({ stats, currency = "VND", locale = "vi-VN" }: { stats: Stats; currency?: string; locale?: string }) {
  const money = (n: number) => formatMoney(n, currency, locale);
  const items = [
    { icon: CheckSquare, label: "Task hoàn thành", value: `${stats.tasksDone}`, accent: "--accent-task" },
    { icon: Repeat, label: "Tỷ lệ thói quen", value: `${stats.habitRate}%`, accent: "--accent-habit" },
    { icon: TrendingUp, label: "Thu nhập", value: money(stats.income), accent: "--accent-finance" },
    { icon: PiggyBank, label: "Tiết kiệm", value: money(stats.savings), accent: "--accent-goal" },
    { icon: BookOpen, label: "Sách xong", value: `${stats.booksFinished}`, accent: "--accent-brain" },
    { icon: Clapperboard, label: "Phim đã xem", value: `${stats.moviesWatched}`, accent: "--accent-learning" },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <Card key={it.label} className="p-4">
          <div className="grid size-8 place-items-center rounded-lg" style={{ background: `hsl(var(${it.accent}) / 0.15)`, color: `hsl(var(${it.accent}))` }}>
            <it.icon className="size-4" />
          </div>
          <p className="mt-2.5 text-lg font-semibold tabular-nums">{it.value}</p>
          <p className="text-xs text-muted-foreground">{it.label}</p>
        </Card>
      ))}
    </div>
  );
}
