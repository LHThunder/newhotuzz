"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LiveClock({
  className,
  showSeconds = false,
}: {
  className?: string;
  showSeconds?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <span className={cn("tabular-nums", className)}>--:--</span>;

  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds ? { second: "2-digit" } : {}),
  });

  return (
    <span className={cn("font-mono text-sm tabular-nums text-muted-foreground", className)}>
      {time}
    </span>
  );
}
