"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { updateBoardGame, deleteBoardGame } from "@/server/actions/collections";
import { cn } from "@/lib/utils";

type Game = { id: string; name: string; timesPlayed: number; owned: boolean; rating: number | null };

export function BoardGameItem({ game }: { game: Game }) {
  const router = useRouter();
  const save = async (data: Parameters<typeof updateBoardGame>[1]) => { await updateBoardGame(game.id, data); router.refresh(); };
  const del = async () => { await deleteBoardGame(game.id); router.refresh(); };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-lg">🎲</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{game.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => save({ owned: !game.owned })}
              className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", game.owned ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground")}>
              {game.owned ? "Sở hữu" : "Wishlist"}
            </button>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => save({ rating: i })}>
                  <Star className={cn("size-3.5", (game.rating ?? 0) >= i ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Times played */}
        <div className="flex items-center gap-1">
          <button onClick={() => save({ timesPlayed: Math.max(0, game.timesPlayed - 1) })} className="grid size-7 place-items-center rounded-lg border border-border hover:bg-accent"><Minus className="size-3.5" /></button>
          <span className="w-8 text-center text-sm tabular-nums" title="Số lần chơi">{game.timesPlayed}×</span>
          <button onClick={() => save({ timesPlayed: game.timesPlayed + 1 })} className="grid size-7 place-items-center rounded-lg border border-border hover:bg-accent"><Plus className="size-3.5" /></button>
        </div>
        <button onClick={del}><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></button>
      </CardContent>
    </Card>
  );
}
