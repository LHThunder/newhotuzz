import { Clapperboard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createMovie } from "@/server/actions/tracker";
import { MovieItem } from "@/components/tracker/movie-item";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Movies — LIFE OS" };

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
            <MovieItem key={m.id} movie={{ id: m.id, title: m.title, status: m.status, rating: m.rating }} />
          ))}
        </div>
      )}
    </div>
  );
}
