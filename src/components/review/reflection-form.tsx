"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { saveReview } from "@/server/actions/review";
import { cn } from "@/lib/utils";

type Field = { key: string; label: string; placeholder?: string };

export function ReflectionForm({
  type,
  periodKey,
  fields,
  initial,
}: {
  type: "weekly_plan" | "weekly_review" | "monthly_review";
  periodKey: string;
  fields: Field[];
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function persist(next: Record<string, string>) {
    setSaving(true);
    await saveReview({ type, periodKey, data: next });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center justify-end">
          <span className={cn("flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity", saving || saved ? "opacity-100" : "opacity-0")}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-emerald-400" />}
            {saving ? "Đang lưu…" : "Đã lưu"}
          </span>
        </div>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-sm font-medium">{f.label}</label>
            <textarea
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              onBlur={() => persist(values)}
              placeholder={f.placeholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
