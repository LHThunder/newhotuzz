import { Brain } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createNoteQuick } from "@/server/actions/note";
import { Card, CardContent } from "@/components/ui/card";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/tracker/delete-button";

export const metadata = { title: "Second Brain — LIFE OS" };

export default async function BrainPage() {
  const user = await ensureUser();
  const notes = user
    ? await prisma.note.findMany({
        where: { userId: user.id, archivedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Second Brain</h1>
        <p className="text-sm text-muted-foreground">Ghi chú, ý tưởng, kiến thức của bạn.</p>
      </div>

      <InlineAdd action={createNoteQuick} placeholder="Ghi chú / ý tưởng nhanh…" />

      {notes.length === 0 ? (
        <EmptyState icon={Brain} title="Chưa có ghi chú" description="Lưu ý tưởng đầu tiên ở trên." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-snug">{n.title}</p>
                  <DeleteButton type="note" id={n.id} className="-mr-1 -mt-1 shrink-0" />
                </div>
                {n.content && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{n.content}</p>}
                <p className="mt-2 text-[11px] capitalize text-muted-foreground/70">{n.kind}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
