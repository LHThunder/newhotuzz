"use client";

import { useRouter } from "next/navigation";
import { Trash2, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { deleteAchievement } from "@/server/actions/collections";

type Ach = { id: string; title: string; description: string | null; date: string };

export function AchievementCard({ ach }: { ach: Ach }) {
  const router = useRouter();
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-400">
          <Trophy className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{ach.title}</p>
          <p className="text-xs text-muted-foreground">{ach.date}{ach.description ? ` · ${ach.description}` : ""}</p>
        </div>
        <button onClick={async () => { await deleteAchievement(ach.id); router.refresh(); }}>
          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </CardContent>
    </Card>
  );
}
