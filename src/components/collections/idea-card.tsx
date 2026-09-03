"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, FolderPlus, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { updateIdea, deleteIdea, ideaToProject } from "@/server/actions/collections";
import { cn } from "@/lib/utils";

type Idea = { id: string; title: string; status: string; category: string | null; notes: string | null };

const cycle = ["idea", "exploring", "done", "dropped"];
const label: Record<string, string> = { idea: "Ý tưởng", exploring: "Đang thử", done: "Xong", dropped: "Bỏ" };
const style: Record<string, string> = {
  idea: "bg-muted text-muted-foreground", exploring: "bg-amber-500/15 text-amber-400",
  done: "bg-emerald-500/15 text-emerald-400", dropped: "bg-red-500/15 text-red-400",
};

export function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(idea.notes ?? "");
  const next = cycle[(cycle.indexOf(idea.status) + 1) % cycle.length];

  const run = async (fn: () => Promise<unknown>) => { await fn(); router.refresh(); };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <p className="min-w-0 flex-1 truncate font-medium">{idea.title}</p>
          <button onClick={() => run(() => updateIdea(idea.id, { status: next }))} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", style[idea.status])}>
            {label[idea.status] ?? idea.status}
          </button>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <button onClick={() => run(() => deleteIdea(idea.id))}><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></button>
        </div>

        {open && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (idea.notes ?? "") && run(() => updateIdea(idea.id, { notes }))}
              placeholder="Chi tiết ý tưởng…" rows={2} className="w-full resize-none rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => run(() => ideaToProject(idea.id))} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
              <FolderPlus className="size-3.5" /> Chuyển thành Project
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
