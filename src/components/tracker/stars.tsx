"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Clickable 1–5 star rating that persists via the given action. */
export function Stars({
  value,
  onRate,
}: {
  value: number | null;
  onRate: (rating: number) => Promise<unknown>;
}) {
  const router = useRouter();
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const current = value ?? 0;

  async function set(r: number) {
    if (busy) return;
    setBusy(true);
    await onRate(r);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} onMouseEnter={() => setHover(i)} onClick={() => set(i)} disabled={busy}>
          <Star className={cn("size-4 transition-colors", (hover || current) >= i ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
        </button>
      ))}
    </div>
  );
}
