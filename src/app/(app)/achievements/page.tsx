import { Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createAchievement } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { AchievementCard } from "@/components/collections/achievement-card";

export const metadata = { title: "Achievements — LIFE OS" };

export default async function AchievementsPage() {
  const user = await ensureUser();
  const items = user
    ? await prisma.achievement.findMany({ where: { userId: user.id }, orderBy: { unlockedAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-sm text-muted-foreground">Cột mốc & thành tựu đáng nhớ.</p>
      </div>

      <InlineAdd action={createAchievement} placeholder="Thành tựu bạn đạt được…" />

      {items.length === 0 ? (
        <EmptyState icon={Award} title="Chưa có thành tựu" description="Ghi lại cột mốc đầu tiên ở trên." />
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <AchievementCard
              key={a.id}
              ach={{ id: a.id, title: a.title, description: a.description, date: new Date(a.unlockedAt).toLocaleDateString("vi-VN") }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
