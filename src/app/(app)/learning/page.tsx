import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { LearningView } from "@/components/learning/learning-view";

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
        <p className="text-sm text-muted-foreground">Khoá học, video, bài viết & chứng chỉ.</p>
      </div>

      <LearningView
        courses={courses.map((c) => ({
          id: c.id, title: c.title, kind: c.kind, provider: c.provider,
          progress: c.progress, status: c.status, hoursSpent: Number(c.hoursSpent),
        }))}
      />
    </div>
  );
}
