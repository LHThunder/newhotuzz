import { Lightbulb } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createIdea } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { IdeaCard } from "@/components/collections/idea-card";

export const metadata = { title: "Ideas — LIFE OS" };

export default async function IdeasPage() {
  const user = await ensureUser();
  const ideas = user
    ? await prisma.idea.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
        <p className="text-sm text-muted-foreground">Kho ý tưởng — có thể chuyển thành Project.</p>
      </div>

      <InlineAdd action={createIdea} placeholder="Ý tưởng mới…" />

      {ideas.length === 0 ? (
        <EmptyState icon={Lightbulb} title="Chưa có ý tưởng" description="Ghi lại ý tưởng đầu tiên ở trên." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ideas.map((i) => (
            <IdeaCard key={i.id} idea={{ id: i.id, title: i.title, status: i.status, category: i.category, notes: i.notes }} />
          ))}
        </div>
      )}
    </div>
  );
}
