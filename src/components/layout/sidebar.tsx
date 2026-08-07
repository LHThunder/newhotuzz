"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Command, Plus, Sparkles, LogOut } from "lucide-react";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { setCommandOpen, setQuickAddOpen } = useUIStore();

  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r px-3 py-4 md:flex">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-2 pb-3">
        <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
          <Sparkles className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">LIFE OS</p>
          <p className="text-[11px] text-muted-foreground">Mission Control</p>
        </div>
      </div>

      {/* Command + Quick add */}
      <div className="flex gap-2 px-1 pb-2">
        <Button
          variant="glass"
          size="sm"
          className="flex-1 justify-between text-muted-foreground"
          onClick={() => setCommandOpen(true)}
        >
          <span className="flex items-center gap-2">
            <Command className="size-3.5" /> Tìm kiếm
          </span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </Button>
        <Button size="icon" className="size-8" onClick={() => setQuickAddOpen(true)}>
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-1 pt-2">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-lg bg-accent"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <item.icon
                      className="size-[18px] shrink-0"
                      style={
                        item.accent
                          ? { color: `hsl(var(${item.accent}))` }
                          : undefined
                      }
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="hidden text-[10px] text-muted-foreground/60 group-hover:inline">
                        {item.shortcut}
                      </kbd>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / profile */}
      <div className="mt-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/50">
        <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-500" />
        <div className="flex-1 leading-tight">
          <p className="text-xs font-medium">Tùng</p>
          <p className="text-[11px] text-muted-foreground">Level 12 · 4,820 XP</p>
        </div>
        <Link
          href="/login"
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Đăng xuất"
        >
          <LogOut className="size-4" />
        </Link>
      </div>
    </aside>
  );
}
