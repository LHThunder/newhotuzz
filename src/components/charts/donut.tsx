"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatVND } from "@/lib/utils";

type Slice = { category: string; amount: number; color: string };

export function Donut({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((d) => (
            <Cell key={d.category} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(v: number, n) => [formatVND(v), n]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
