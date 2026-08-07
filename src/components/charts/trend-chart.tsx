"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { label: string; value: number };

export function TrendChart({ data, unit = "", color = "hsl(var(--accent-brain))" }: { data: Point[]; unit?: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} width={36} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
          formatter={(v: number) => [`${v} ${unit}`, ""]}
        />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
