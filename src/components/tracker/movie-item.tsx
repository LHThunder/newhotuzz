"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Stars } from "@/components/tracker/stars";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateMovie } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type Movie = { id: string; title: string; status: string; rating: number | null };

const cycle = ["watchlist", "watching", "watched"];
const statusLabel: Record<string, string> = { watchlist: "Muốn xem", watching: "Đang xem", watched: "Đã xem" };
const statusStyle: Record<string, string> = {
  watchlist: "bg-muted text-muted-foreground", watching: "bg-amber-500/15 text-amber-400", watched: "bg-emerald-500/15 text-emerald-400",
};

export function MovieItem({ movie }: { movie: Movie }) {
  const router = useRouter();
  const next = cycle[(cycle.indexOf(movie.status) + 1) % cycle.length];

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-lg">🎬</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{movie.title}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              onClick={async () => { await updateMovie(movie.id, { status: next }); router.refresh(); }}
              className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors", statusStyle[movie.status])}
            >
              {statusLabel[movie.status] ?? movie.status}
            </button>
            <Stars value={movie.rating} onRate={(r) => updateMovie(movie.id, { rating: r })} />
          </div>
        </div>
        <DeleteButton type="movie" id={movie.id} />
      </CardContent>
    </Card>
  );
}
