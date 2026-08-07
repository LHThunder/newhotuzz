"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Plus, Repeat, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const items = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/habits", icon: Repeat, label: "Habits" },
  { href: "/analytics", icon: BarChart3, label: "Stats" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setQuickAddOpen } = useUIStore();

  return (
    <nav className="glass-strong fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 md:hidden">
      {items.slice(0, 2).map((it) => (
        <Tab key={it.href} {...it} active={pathname === it.href} />
      ))}
      <button
        onClick={() => setQuickAddOpen(true)}
        className="grid size-11 -translate-y-1 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow"
      >
        <Plus className="size-5" />
      </button>
      {items.slice(2).map((it) => (
        <Tab key={it.href} {...it} active={pathname.startsWith(it.href)} />
      ))}
    </nav>
  );
}

function Tab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px]",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
