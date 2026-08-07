"use client";

import { motion } from "framer-motion";

export function Ring({
  value,
  size = 120,
  stroke = 10,
  color = "hsl(var(--primary))",
  track = "hsl(var(--muted))",
  label,
  sublabel,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums">{label ?? `${value}%`}</span>
        {sublabel && <span className="text-[11px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
