"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Clock, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { CourseItem } from "@/components/tracker/course-item";
import { createLearningItem } from "@/server/actions/tracker";
import { cn } from "@/lib/utils";

type Course = { id: string; title: string; kind: string; provider: string | null; progress: number; status: string; hoursSpent: number };

const kinds = [
  { key: "all", label: "Tất cả", emoji: "📚" },
  { key: "course", label: "Khoá học", emoji: "🎓" },
  { key: "video", label: "Video", emoji: "🎬" },
  { key: "article", label: "Bài viết", emoji: "📄" },
  { key: "book", label: "Sách", emoji: "📗" },
  { key: "certificate", label: "Chứng chỉ", emoji: "🏅" },
];

export function LearningView({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);

  const filtered = tab === "all" ? courses : courses.filter((c) => c.kind === tab);
  const totalHours = courses.reduce((s, c) => s + c.hoursSpent, 0);
  const doneCount = courses.filter((c) => c.status === "done").length;
  const addKind = tab === "all" ? "course" : tab;

  async function add() {
    if (!title.trim()) return;
    setPending(true);
    await createLearningItem(title.trim(), addKind);
    setPending(false);
    setTitle("");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tổng mục học" value={`${courses.length}`} />
        <StatCard label="Đã hoàn thành" value={`${doneCount}`} />
        <StatCard label="Giờ học" value={`${totalHours}h`} icon />
      </div>

      {/* Tabs */}
      <div className="glass ring-hairline flex gap-1 overflow-x-auto rounded-xl p-1">
        {kinds.map((k) => (
          <button key={k.key} onClick={() => setTab(k.key)}
            className={cn("flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
              tab === k.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent/50")}>
            <span>{k.emoji}</span> {k.label}
          </button>
        ))}
      </div>

      {/* Add bar */}
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={`Thêm ${kinds.find((k) => k.key === addKind)?.label.toLowerCase()} mới…`} className="h-10" />
        <Button onClick={add} disabled={!title.trim() || pending} className="shrink-0 gap-1.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Thêm
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Chưa có mục nào" description="Thêm mục học đầu tiên ở trên." />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => <CourseItem key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1 text-lg font-semibold tabular-nums">
        {icon && <Clock className="size-4 text-sky-400" />} {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
