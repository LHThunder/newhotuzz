import { HeartPulse } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { HealthLogger } from "@/components/health/health-logger";
import { TrendChart } from "@/components/charts/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/tracker/delete-button";

export const metadata = { title: "Health — LIFE OS" };

const kindLabel: Record<string, string> = {
  water: "Nước", weight: "Cân nặng", steps: "Số bước", meditation: "Thiền", calories: "Calo", heart_rate: "Nhịp tim",
};
const kindUnit: Record<string, string> = { water: "ml", weight: "kg", steps: "", meditation: "phút", calories: "kcal", heart_rate: "bpm" };

const isDateStr = (s?: string): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export default async function HealthPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await ensureUser();
  const dateParam = (await searchParams).date;

  const now = new Date();
  const selectedDate = isDateStr(dateParam) ? dateParam : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const start = new Date(`${selectedDate}T00:00:00`);
  const end = new Date(start); end.setDate(end.getDate() + 1);

  const [dayMetrics, recent, weightLogs] = user
    ? await Promise.all([
        prisma.healthMetric.findMany({ where: { userId: user.id, date: { gte: start, lt: end } }, orderBy: { date: "desc" } }),
        prisma.healthMetric.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 15 }),
        prisma.healthMetric.findMany({ where: { userId: user.id, kind: "weight" }, orderBy: { date: "asc" }, take: 30 }),
      ])
    : [[], [], []];

  const waterMl = dayMetrics.filter((m) => m.kind === "water").reduce((s, m) => s + m.value, 0);
  const waterGoal = user?.settings?.waterGoalMl ?? 2500;
  const weightSeries = weightLogs.map((w) => ({
    label: new Date(w.date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
    value: w.value,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Health</h1>
        <p className="text-sm text-muted-foreground">Theo dõi sức khoẻ theo từng ngày — chọn ngày để xem & điền.</p>
      </div>

      <HealthLogger waterMl={waterMl} waterGoal={waterGoal} date={selectedDate} />

      {/* Metrics logged on the selected day */}
      <Card>
        <CardHeader><CardTitle>Chỉ số ngày này</CardTitle></CardHeader>
        <CardContent>
          {dayMetrics.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Chưa có chỉ số nào cho ngày này.</p>
          ) : (
            <div className="space-y-1">
              {dayMetrics.map((m) => (
                <div key={m.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-accent/30">
                  <span className="flex-1">{kindLabel[m.kind] ?? m.kind}</span>
                  <span className="font-medium tabular-nums">{m.value.toLocaleString("vi-VN")} {kindUnit[m.kind] ?? ""}</span>
                  <DeleteButton type="health" id={m.id} className="opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {weightSeries.length >= 2 && (
        <Card>
          <CardHeader><CardTitle>Xu hướng cân nặng</CardTitle></CardHeader>
          <CardContent><TrendChart data={weightSeries} unit="kg" color="hsl(var(--accent-brain))" /></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Lịch sử gần đây</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState icon={HeartPulse} title="Chưa có dữ liệu" description="Ghi lại chỉ số sức khoẻ đầu tiên ở trên." className="border-0 py-6" />
          ) : (
            <div className="space-y-1">
              {recent.map((m) => (
                <div key={m.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-accent/30">
                  <span className="flex-1">{kindLabel[m.kind] ?? m.kind}</span>
                  <span className="font-medium tabular-nums">{m.value.toLocaleString("vi-VN")} {kindUnit[m.kind] ?? ""}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}</span>
                  <DeleteButton type="health" id={m.id} className="opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
