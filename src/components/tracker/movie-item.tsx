"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stars } from "@/components/tracker/stars";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateMovie } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type Movie = { id: string; title: string; status: string; rating: number | null; kind: string; review: string | null };

const cycle = ["watchlist", "watching", "watched"];
const statusLabel: Record<string, string> = { watchlist: "Muốn xem", watching: "Đang xem", watched: "Đã xem" };
const statusStyle: Record<string, string> = {
  watchlist: "bg-muted text-muted-foreground", watching: "bg-amber-500/15 text-amber-400", watched: "bg-emerald-500/15 text-emerald-400",
};

export function MovieItem({ movie }: { movie: Movie }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState(movie.review ?? "");
  const next = cycle[(cycle.indexOf(movie.status) + 1) % cycle.length];

  const save = async (data: Parameters<typeof updateMovie>[1]) => { await updateMovie(movie.id, data); router.refresh(); };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-lg">{movie.kind === "series" ? "📺" : "🎬"}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{movie.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <button onClick={() => save({ status: next })} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusStyle[movie.status])}>
                {statusLabel[movie.status] ?? movie.status}
              </button>
              <button onClick={() => save({ kind: movie.kind === "series" ? "movie" : "series" })}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {movie.kind === "series" ? "Series" : "Phim lẻ"}
              </button>
              <Stars value={movie.rating} onRate={(r) => updateMovie(movie.id, { rating: r })} />
            </div>
          </div>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <DeleteButton type="movie" id={movie.id} />
        </div>

        {open && (
          <div className="mt-3 border-t border-border pt-3">
            <textarea value={review} onChange={(e) => setReview(e.target.value)} onBlur={() => review !== (movie.review ?? "") && save({ review })}
              placeholder="Cảm nhận / review…" rows={2} className="w-full resize-none rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
