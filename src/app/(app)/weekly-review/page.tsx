import { ClipboardCheck } from "lucide-react";
import { ensureUser } from "@/server/services/user.service";
import { reviewService } from "@/server/services/review.service";
import { weekBounds, weekKey, weekLabel } from "@/lib/period";
import { localeFor } from "@/lib/settings-config";
import { StatsGrid } from "@/components/review/stats-grid";
import { ReflectionForm } from "@/components/review/reflection-form";

export const metadata = { title: "Weekly Review — LIFE OS" };

export default async function WeeklyReviewPage() {
  const user = await ensureUser();
  const range = weekBounds();
  const key = weekKey();

  const [stats, saved] = user
    ? await Promise.all([reviewService.stats(user.id, range), reviewService.get(user.id, "weekly_review", key)])
    : [{ tasksDone: 0, tasksCreated: 0, habitLogs: 0, habitRate: 0, income: 0, expense: 0, savings: 0, booksFinished: 0, moviesWatched: 0 }, null];

  const currency = user?.settings?.currency ?? "VND";
  const locale = localeFor[user?.settings?.language ?? "vi"] ?? "vi-VN";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ClipboardCheck className="size-6 text-primary" /> Weekly Review
        </h1>
        <p className="text-sm text-muted-foreground">Tuần {key} · {weekLabel()}</p>
      </div>

      <StatsGrid stats={stats} currency={currency} locale={locale} />

      <ReflectionForm
        type="weekly_review"
        periodKey={key}
        initial={(saved?.data as Record<string, string>) ?? {}}
        fields={[
          { key: "well", label: "✅ Điều gì diễn ra tốt?", placeholder: "Thành tựu, điều tự hào…" },
          { key: "wrong", label: "⚠️ Điều gì chưa ổn?", placeholder: "Khó khăn, chưa làm được…" },
          { key: "learned", label: "💡 Học được gì?" },
          { key: "improve", label: "🔧 Cần cải thiện gì?" },
          { key: "next", label: "➡️ Tập trung gì tuần tới?" },
        ]}
      />
    </div>
  );
}
