"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Landmark, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { key: "accounts", label: "Tài khoản", icon: Landmark },
  { key: "reports", label: "Báo cáo", icon: BarChart3 },
];

export function FinanceTabs() {
  const pathname = usePathname();
  const current = useSearchParams().get("tab") ?? "overview";
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
      {tabs.map((t) => {
        const active = current === t.key;
        return (
          <Link key={t.key} href={`${pathname}?tab=${t.key}`} scroll={false}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}>
            <t.icon className="size-4" /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
