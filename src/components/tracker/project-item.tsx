"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateProject } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type Project = { id: string; name: string; emoji: string | null; color: string; status: string; taskCount: number };

const emojis = ["🚀", "💡", "📝", "🎥", "📚", "🎯", "💼", "🎨", "🏋️", "🌱"];
const cycle = ["active", "paused", "done"];
const statusLabel: Record<string, string> = { active: "Đang chạy", paused: "Tạm dừng", done: "Hoàn thành", archived: "Lưu trữ" };
const statusStyle: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400", paused: "bg-amber-500/15 text-amber-400", done: "bg-sky-500/15 text-sky-400", archived: "bg-muted text-muted-foreground",
};

export function ProjectItem({ project }: { project: Project }) {
  const router = useRouter();
  const [pickEmoji, setPickEmoji] = useState(false);
  const next = cycle[(cycle.indexOf(project.status) + 1) % cycle.length];

  const save = async (data: Parameters<typeof updateProject>[1]) => { await updateProject(project.id, data); router.refresh(); };

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <div className="relative">
          <button onClick={() => setPickEmoji(!pickEmoji)} className="grid size-10 place-items-center rounded-xl text-xl" style={{ background: `${project.color}22` }}>
            {project.emoji ?? "🚀"}
          </button>
          {pickEmoji && (
            <div className="glass-strong absolute left-0 top-12 z-10 grid w-40 grid-cols-5 gap-1 rounded-xl p-2 shadow-glass">
              {emojis.map((e) => (
                <button key={e} onClick={() => { save({ emoji: e }); setPickEmoji(false); }} className="grid size-7 place-items-center rounded-lg text-lg hover:bg-accent/50">{e}</button>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{project.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => save({ status: next })} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusStyle[project.status])}>
              {statusLabel[project.status] ?? project.status}
            </button>
            <span className="text-[11px] text-muted-foreground">{project.taskCount} task</span>
          </div>
        </div>
        <DeleteButton type="project" id={project.id} />
      </CardContent>
    </Card>
  );
}
