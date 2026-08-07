"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateCourse } from "@/server/actions/item";

type Course = { id: string; title: string; provider: string | null; progress: number; status: string };

const statusLabel: Record<string, string> = { learning: "Đang học", done: "Hoàn thành", wishlist: "Dự định" };

export function CourseItem({ course }: { course: Course }) {
  const router = useRouter();

  async function bump(delta: number) {
    const p = Math.max(0, Math.min(100, course.progress + delta));
    await updateCourse(course.id, { progress: p });
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 truncate font-medium">{course.title}</p>
          <Badge variant="outline" className="text-[10px]">{statusLabel[course.status] ?? course.status}</Badge>
          <DeleteButton type="course" id={course.id} />
        </div>
        {course.provider && <p className="text-xs text-muted-foreground">{course.provider}</p>}
        <Progress value={course.progress} className="mt-2.5 h-1.5" indicatorClassName="bg-sky-500" />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => bump(-10)} className="grid size-7 place-items-center rounded-lg border border-border hover:bg-accent"><Minus className="size-3.5" /></button>
            <button onClick={() => bump(10)} className="grid size-7 place-items-center rounded-lg border border-border hover:bg-accent"><Plus className="size-3.5" /></button>
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">{course.progress}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
