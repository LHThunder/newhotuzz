import { Clapperboard, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createMovie } from "@/server/actions/tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Movies — LIFE OS" };

const statusLabel: Record<string, string> = { watchlist: "Muốn xem", watching: "Đang xem", watched: "Đã xem" };

export default async function MoviesPage() {
  const user = await ensureUser();
  const movies = user
    ? await prisma.movie.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Movies</h1>
        <p className="text-sm text-muted-foreground">Watchlist & phim đã xem.</p>
      </div>

      <InlineAdd action={createMovie} placeholder="Tên phim / series…" />

      {movies.length === 0 ? (
        <EmptyState icon={Clapperboard} title="Chưa có phim" description="Thêm phim vào watchlist ở trên." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {movies.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center gap-3 pt-4">
                <span className="grid size-10 place-items-center rounded-lg bg-muted text-lg">🎬</span>
                <div className="flex-1">
                  <p className="font-medium">{m.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{statusLabel[m.status] ?? m.status}</Badge>
                    {m.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-400">
                        <Star className="size-3 fill-amber-400" /> {m.rating}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
