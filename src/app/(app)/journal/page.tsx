import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { Card, CardContent } from "@/components/ui/card";
import { JournalComposer } from "@/components/journal/composer";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Journal — LIFE OS" };

const moodEmoji = ["", "😞", "😕", "😐", "🙂", "😄"];

export default async function JournalPage() {
  const user = await ensureUser();
  const entries = user
    ? await prisma.journalEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground">Nhật ký & tâm trạng mỗi ngày.</p>
      </div>

      <JournalComposer />

      {entries.length === 0 ? (
        <EmptyState icon={BookOpen} title="Chưa có nhật ký" description="Viết dòng nhật ký đầu tiên ở trên." />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id}>
              <CardContent className="pt-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  {e.mood && <span className="text-base">{moodEmoji[e.mood]}</span>}
                  <span>{new Date(e.createdAt).toLocaleString("vi-VN", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{e.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
