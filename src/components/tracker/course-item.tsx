"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ChevronDown, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateCourse, updateCourseDetail } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type Course = { id: string; title: string; kind: string; provider: string | null; progress: number; status: string; hoursSpent: number };

const statusLabel: Record<string, string> = { learning: "Đang học", done: "Hoàn thành", wishlist: "Dự định" };
const kindEmoji: Record<string, string> = { course: "🎓", video: "🎬", article: "📄", book: "📗", certificate: "🏅" };

export function CourseItem({ course }: { course: Course }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState(course.provider ?? "");
  const [hours, setHours] = useState(course.hoursSpent?.toString() ?? "");

  async function bump(delta: number) {
    const p = Math.max(0, Math.min(100, course.progress + delta));
    await updateCourse(course.id, { progress: p });
    router.refresh();
  }
  const saveDetail = async (data: Parameters<typeof updateCourseDetail>[1]) => { await updateCourseDetail(course.id, data); router.refresh(); };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="shrink-0 text-lg">{kindEmoji[course.kind] ?? "🎓"}</span>
          <p className="min-w-0 flex-1 truncate font-medium">{course.title}</p>
          <Badge variant="outline" className="text-[10px]">{statusLabel[course.status] ?? course.status}</Badge>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <DeleteButton type="course" id={course.id} />
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {course.provider && <span>{course.provider}</span>}
          {course.hoursSpent > 0 && <span className="flex items-center gap-0.5"><Clock className="size-3" /> {course.hoursSpent}h</span>}
        </p>
        <Progress value={course.progress} className="mt-2.5 h-1.5" indicatorClassName="bg-sky-500" />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => bump(-10)} className="grid size-7 place-items-center rounded-lg border border-border hover:bg-accent"><Minus className="size-3.5" /></button>
            <button onClick={() => bump(10)} className="grid size-7 place-items-center rounded-lg border border-border hover:bg-accent"><Plus className="size-3.5" /></button>
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">{course.progress}%</span>
        </div>

        {open && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} onBlur={() => provider !== (course.provider ?? "") && saveDetail({ provider })} placeholder="Nền tảng (Coursera, Udemy…)" className="h-9 flex-1" />
            <Input inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, ""))} onBlur={() => saveDetail({ hoursSpent: Number(hours) || 0 })} placeholder="Số giờ" className="h-9 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
