"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import {
  Palette, Globe, Target, Bell, Check, Loader2, Sun, Moon, Monitor, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { accentColors, languages, currencies, timezones, themes } from "@/lib/settings-config";
import { applyAccent } from "@/components/settings/accent-provider";
import { updateSettings } from "@/server/actions/settings";

type Settings = {
  theme: string; accentColor: string; language: string; currency: string; location: string | null;
  timezone: string; weekStartsOn: number; waterGoalMl: number;
  sleepGoalMin: number; focusGoalMin: number; notifications: unknown;
};

const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const;

export function SettingsForm({ initial }: { initial: Settings }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [s, setS] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const notif = (s.notifications as Record<string, boolean>) ?? {};

  function save(patch: Partial<Settings>) {
    const nextState = { ...s, ...patch };
    setS(nextState);
    startTransition(async () => {
      await updateSettings(patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Cá nhân hoá LIFE OS của bạn.</p>
        </div>
        <span className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity",
          saved || pending ? "opacity-100" : "opacity-0",
        )}>
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-emerald-400" />}
          {pending ? "Đang lưu…" : "Đã lưu"}
        </span>
      </div>

      {/* Appearance */}
      <Section icon={Palette} title="Giao diện">
        <Row label="Chủ đề">
          <div className="flex gap-2">
            {themes.map((t) => {
              const Icon = themeIcons[t.key as keyof typeof themeIcons];
              const active = s.theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => { setTheme(t.key); save({ theme: t.key }); }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    active ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  <Icon className="size-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </Row>
        <Row label="Màu nhấn">
          <div className="flex flex-wrap gap-2">
            {Object.entries(accentColors).map(([key, c]) => {
              const active = s.accentColor === key;
              return (
                <button
                  key={key}
                  onClick={() => { applyAccent(key, resolvedTheme === "dark"); save({ accentColor: key }); }}
                  title={c.label}
                  className={cn(
                    "size-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                    active ? "ring-foreground/40 scale-110" : "ring-transparent hover:scale-105",
                  )}
                  style={{ background: `hsl(${resolvedTheme === "dark" ? c.dark : c.hsl})` }}
                />
              );
            })}
          </div>
        </Row>
      </Section>

      {/* Localization */}
      <Section icon={Globe} title="Ngôn ngữ & vùng">
        <Row label="Ngôn ngữ">
          <div className="flex gap-2">
            {languages.map((l) => (
              <button
                key={l.key}
                onClick={() => save({ language: l.key })}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  s.language === l.key ? "border-primary/50 bg-primary/10" : "border-border text-muted-foreground hover:bg-accent/40",
                )}
              >
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Tiền tệ">
          <Select
            value={s.currency}
            onChange={(v) => save({ currency: v })}
            options={currencies.map((c) => ({ value: c.key, label: `${c.symbol} ${c.label}` }))}
          />
        </Row>
        <Row label="Vị trí">
          <div className="relative w-56">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue={s.location ?? ""}
              onBlur={(e) => save({ location: e.target.value })}
              placeholder="Thành phố (vd Đà Nẵng)"
              className="pl-9"
            />
          </div>
        </Row>
        <Row label="Múi giờ">
          <Select value={s.timezone} onChange={(v) => save({ timezone: v })} options={timezones.map((t) => ({ value: t, label: t }))} />
        </Row>
        <Row label="Đầu tuần">
          <div className="flex gap-2">
            {[{ v: 1, l: "Thứ 2" }, { v: 0, l: "Chủ nhật" }].map((o) => (
              <button
                key={o.v}
                onClick={() => save({ weekStartsOn: o.v })}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  s.weekStartsOn === o.v ? "border-primary/50 bg-primary/10" : "border-border text-muted-foreground hover:bg-accent/40",
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Daily goals */}
      <Section icon={Target} title="Mục tiêu hằng ngày">
        <Row label="Uống nước (ml)">
          <NumberInput value={s.waterGoalMl} step={250} onChange={(v) => save({ waterGoalMl: v })} />
        </Row>
        <Row label="Ngủ (giờ)">
          <NumberInput value={Math.round(s.sleepGoalMin / 60)} step={1} onChange={(v) => save({ sleepGoalMin: v * 60 })} />
        </Row>
        <Row label="Focus (phút)">
          <NumberInput value={s.focusGoalMin} step={30} onChange={(v) => save({ focusGoalMin: v })} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Thông báo">
        <Toggle label="Nhắc thói quen" on={notif.habits ?? true} onChange={(v) => save({ notifications: { ...notif, habits: v } })} />
        <Toggle label="Tóm tắt cuối ngày" on={notif.dailySummary ?? true} onChange={(v) => save({ notifications: { ...notif, dailySummary: v } })} />
        <Toggle label="Review cuối tuần" on={notif.weeklyReview ?? false} onChange={(v) => save({ notifications: { ...notif, weeklyReview: v } })} />
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof Palette; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function NumberInput({ value, step, onChange }: { value: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(0, value - step))} className="grid size-8 place-items-center rounded-lg border border-border hover:bg-accent">−</button>
      <span className="w-16 text-center text-sm font-medium tabular-nums">{value.toLocaleString("vi-VN")}</span>
      <button onClick={() => onChange(value + step)} className="grid size-8 place-items-center rounded-lg border border-border hover:bg-accent">+</button>
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        onClick={() => onChange(!on)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
      ))}
    </select>
  );
}
