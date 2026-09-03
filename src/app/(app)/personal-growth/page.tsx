import Link from "next/link";
import { Target, Repeat, GraduationCap, Brain, BookOpen, Award, ArrowRight, Sprout } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Personal Growth — LIFE OS" };

export default async function PersonalGrowthPage() {
  const user = await ensureUser();

  const [goals, habits, courses, notes, journal, achievements] = user
    ? await Promise.all([
        prisma.goal.count({ where: { userId: user.id, status: "active" } }),
        prisma.habit.count({ where: { userId: user.id, archivedAt: null } }),
        prisma.course.count({ where: { userId: user.id, status: "learning" } }),
        prisma.note.count({ where: { userId: user.id, archivedAt: null } }),
        prisma.journalEntry.count({ where: { userId: user.id } }),
        prisma.achievement.count({ where: { userId: user.id } }),
      ])
    : [0, 0, 0, 0, 0, 0];

  const areas = [
    { icon: Target, label: "Mục tiêu đang chạy", value: goals, href: "/goals", color: "--accent-goal" },
    { icon: Repeat, label: "Thói quen đang xây", value: habits, href: "/habits", color: "--accent-habit" },
    { icon: GraduationCap, label: "Đang học", value: courses, href: "/learning", color: "--accent-learning" },
    { icon: Brain, label: "Ghi chú tích luỹ", value: notes, href: "/brain", color: "--accent-brain" },
    { icon: BookOpen, label: "Bài nhật ký", value: journal, href: "/journal", color: "--accent-task" },
    { icon: Award, label: "Thành tựu", value: achievements, href: "/achievements", color: "--accent-finance" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sprout className="size-6 text-primary" /> Personal Growth
        </h1>
        <p className="text-sm text-muted-foreground">Nhìn tổng quan hành trình phát triển bản thân.</p>
      </div>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-14 size-52 rounded-full bg-primary/15 blur-3xl" />
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">Tổng hợp từ các lĩnh vực</p>
          <p className="mt-1 text-lg font-medium">
            Bạn đang theo đuổi <b>{goals}</b> mục tiêu, xây <b>{habits}</b> thói quen và học <b>{courses}</b> chủ đề.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((a) => (
          <Link key={a.label} href={a.href}>
            <Card className="group transition-colors hover:bg-accent/30">
              <CardContent className="flex items-center gap-3 pt-5">
                <span className="grid size-10 place-items-center rounded-xl" style={{ background: `hsl(var(${a.color}) / 0.15)`, color: `hsl(var(${a.color}))` }}>
                  <a.icon className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-xl font-semibold tabular-nums">{a.value}</p>
                  <p className="text-xs text-muted-foreground">{a.label}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
