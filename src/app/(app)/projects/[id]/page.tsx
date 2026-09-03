import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { Progress } from "@/components/ui/progress";
import { ProjectViews } from "@/components/projects/project-views";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await ensureUser();
  if (!user) notFound();

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) notFound();

  const tasks = await prisma.task.findMany({
    where: { userId: user.id, projectId: id, archivedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Projects
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl text-2xl" style={{ background: `${project.color}22` }}>{project.emoji ?? "🚀"}</span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
          </div>
        </div>
        <div className="min-w-[180px]">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Tiến độ</span><span>{done}/{total} · {percent}%</span>
          </div>
          <Progress value={percent} indicatorClassName="bg-primary" />
        </div>
      </div>

      <ProjectViews
        projectId={id}
        tasks={tasks.map((t) => ({
          id: t.id, title: t.title, status: t.status, priority: t.priority,
          startDate: t.startDate ? t.startDate.toISOString().slice(0, 10) : null,
          dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
        }))}
      />
    </div>
  );
}
