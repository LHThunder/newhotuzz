import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createProject } from "@/server/actions/tracker";
import { projectProgress } from "@/server/services/progress.service";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectItem } from "@/components/tracker/project-item";

export const metadata = { title: "Projects — LIFE OS" };

export default async function ProjectsPage() {
  const user = await ensureUser();

  const [projects, progress] = user
    ? await Promise.all([
        prisma.project.findMany({
          where: { userId: user.id, archivedAt: null },
          orderBy: { createdAt: "desc" },
        }),
        projectProgress(user.id),
      ])
    : [[], new Map()];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Dự án cá nhân — tiến độ tự tính từ task.</p>
      </div>

      <InlineAdd action={createProject} placeholder="Tên dự án mới (vd Startup, Blog, Youtube…)" />

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Chưa có dự án" description="Tạo dự án đầu tiên ở trên." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => {
            const pr = progress.get(p.id) ?? { total: 0, done: 0, percent: 0 };
            return (
              <ProjectItem
                key={p.id}
                project={{ id: p.id, name: p.name, emoji: p.emoji, color: p.color, status: p.status }}
                progress={pr}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
