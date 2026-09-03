import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { JournalView } from "@/components/journal/journal-view";

export const metadata = { title: "Journal — LIFE OS" };

export default async function JournalPage() {
  const user = await ensureUser();
  const entries = user
    ? await prisma.journalEntry.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 400 })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground">Chọn ngày trong lịch để viết — mỗi ngày một bài.</p>
      </div>

      <JournalView
        entries={entries.map((e) => ({
          id: e.id,
          dateKey: new Date(e.date).toISOString().slice(0, 10),
          content: e.content,
          mood: e.mood,
        }))}
      />
    </div>
  );
}
