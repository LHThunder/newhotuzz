"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatMoney } from "@/lib/utils";

type Point = { month: string; income: number; expense: number };

export function CashflowChart({ data, currency = "VND", locale = "vi-VN" }: { data: Point[]; currency?: string; locale?: string }) {
  const compact = (n: number) =>
    new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={4}>
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
          formatter={(v: number, n) => [formatMoney(v, currency, locale), n === "income" ? "Thu" : "Chi"]}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => (v === "income" ? "Thu nhập" : "Chi tiêu")} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="hsl(var(--accent-finance))" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" fill="hsl(var(--accent-health))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
