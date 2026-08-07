import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createProject } from "@/server/actions/tracker";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectItem } from "@/components/tracker/project-item";

export const metadata = { title: "Projects — LIFE OS" };

export default async function ProjectsPage() {
  const user = await ensureUser();
  const projects = user
    ? await prisma.project.findMany({
        where: { userId: user.id, archivedAt: null },
        include: { _count: { select: { tasks: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">Quản lý dự án cá nhân của bạn.</p>
      </div>

      <InlineAdd action={createProject} placeholder="Tên dự án mới (vd Startup, Blog, Youtube…)" />

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Chưa có dự án" description="Tạo dự án đầu tiên ở trên." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectItem key={p.id} project={{ id: p.id, name: p.name, emoji: p.emoji, color: p.color, status: p.status, taskCount: p._count.tasks }} />
          ))}
        </div>
      )}
    </div>
  );
}
