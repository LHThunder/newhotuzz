import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createProject } from "@/server/actions/tracker";
import { Card, CardContent } from "@/components/ui/card";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

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
            <Card key={p.id}>
              <CardContent className="flex items-center gap-3 pt-5">
                <span className="grid size-10 place-items-center rounded-xl text-xl" style={{ background: `${p.color}22` }}>
                  {p.emoji ?? "🚀"}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p._count.tasks} task · {p.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
