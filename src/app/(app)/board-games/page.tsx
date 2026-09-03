import { Dices } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createBoardGame } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { BoardGameItem } from "@/components/collections/boardgame-item";

export const metadata = { title: "Board Games — LIFE OS" };

export default async function BoardGamesPage() {
  const user = await ensureUser();
  const games = user
    ? await prisma.boardGame.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Board Games</h1>
        <p className="text-sm text-muted-foreground">Bộ sưu tập & số lần chơi.</p>
      </div>

      <InlineAdd action={createBoardGame} placeholder="Tên board game…" />

      {games.length === 0 ? (
        <EmptyState icon={Dices} title="Chưa có game" description="Thêm board game đầu tiên ở trên." />
      ) : (
        <div className="space-y-2">
          {games.map((g) => (
            <BoardGameItem key={g.id} game={{ id: g.id, name: g.name, timesPlayed: g.timesPlayed, owned: g.owned, rating: g.rating }} />
          ))}
        </div>
      )}
    </div>
  );
}
