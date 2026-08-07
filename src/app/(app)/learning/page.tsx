import { GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createCourse } from "@/server/actions/tracker";
import { CourseItem } from "@/components/tracker/course-item";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Learning — LIFE OS" };

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
            <CourseItem key={c.id} course={{ id: c.id, title: c.title, provider: c.provider, progress: c.progress, status: c.status }} />
          ))}
        </div>
      )}
    </div>
  );
}
