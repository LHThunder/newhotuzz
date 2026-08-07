import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createNoteQuick } from "@/server/actions/note";
import { InlineAdd } from "@/components/ui/inline-add";
import { NotesView } from "@/components/brain/notes-view";

export const metadata = { title: "Second Brain — LIFE OS" };

export default async function BrainPage() {
  const user = await ensureUser();
  const notes = user
    ? await prisma.note.findMany({
        where: { userId: user.id, archivedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 200,
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Second Brain</h1>
        <p className="text-sm text-muted-foreground">Ghi chú, ý tưởng, kiến thức của bạn.</p>
      </div>

      <InlineAdd action={createNoteQuick} placeholder="Ghi chú / ý tưởng nhanh…" />

      <NotesView notes={notes.map((n) => ({ id: n.id, title: n.title, content: n.content, kind: n.kind }))} />
    </div>
  );
}
