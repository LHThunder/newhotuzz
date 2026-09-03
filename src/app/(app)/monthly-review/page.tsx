import { CalendarRange } from "lucide-react";
import { ensureUser } from "@/server/services/user.service";
import { reviewService } from "@/server/services/review.service";
import { monthBounds, monthKey } from "@/lib/period";
import { localeFor } from "@/lib/settings-config";
import { StatsGrid } from "@/components/review/stats-grid";
import { ReflectionForm } from "@/components/review/reflection-form";

export const metadata = { title: "Monthly Review — LIFE OS" };

export default async function MonthlyReviewPage() {
  const user = await ensureUser();
  const range = monthBounds();
  const key = monthKey();
  const monthName = new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const [stats, saved] = user
    ? await Promise.all([reviewService.stats(user.id, range), reviewService.get(user.id, "monthly_review", key)])
    : [{ tasksDone: 0, tasksCreated: 0, habitLogs: 0, habitRate: 0, income: 0, expense: 0, savings: 0, booksFinished: 0, moviesWatched: 0 }, null];

  const currency = user?.settings?.currency ?? "VND";
  const locale = localeFor[user?.settings?.language ?? "vi"] ?? "vi-VN";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarRange className="size-6 text-primary" /> Monthly Review
        </h1>
        <p className="text-sm capitalize text-muted-foreground">{monthName}</p>
      </div>

      <StatsGrid stats={stats} currency={currency} locale={locale} />

      <ReflectionForm
        type="monthly_review"
        periodKey={key}
        initial={(saved?.data as Record<string, string>) ?? {}}
        fields={[
          { key: "wins", label: "🏆 Chiến thắng trong tháng", placeholder: "Thành tựu lớn nhất…" },
          { key: "challenges", label: "⛰️ Thử thách" },
          { key: "lessons", label: "💡 Bài học" },
          { key: "next", label: "➡️ Mục tiêu tháng tới" },
        ]}
      />
    </div>
  );
}
