import { GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createCourse } from "@/server/actions/tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Learning — LIFE OS" };

const statusLabel: Record<string, string> = { learning: "Đang học", done: "Hoàn thành", wishlist: "Dự định" };

export default async function LearningPage() {
  const user = await ensureUser();
  const courses = user
    ? await prisma.course.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Learning</h1>
        <p className="text-sm text-muted-foreground">Khoá học & tiến độ học tập.</p>
      </div>

      <InlineAdd action={createCourse} placeholder="Tên khoá học / chủ đề…" />

      {courses.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Chưa có khoá học" description="Thêm khoá học đầu tiên ở trên." />
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.title}</p>
                  <Badge variant="outline" className="text-[10px]">{statusLabel[c.status] ?? c.status}</Badge>
                </div>
                {c.provider && <p className="text-xs text-muted-foreground">{c.provider}</p>}
                <Progress value={c.progress} className="mt-2.5 h-1.5" indicatorClassName="bg-sky-500" />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">{c.progress}%</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
