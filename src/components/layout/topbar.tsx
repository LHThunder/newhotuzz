"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Search, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/ui-store";
import { LiveClock } from "@/components/dashboard/live-clock";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { setCommandOpen, setQuickAddOpen } = useUIStore();

  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 md:px-6">
      <div className="md:hidden grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Zap className="size-4" />
      </div>

      <button
        onClick={() => setCommandOpen(true)}
        className="glass ring-hairline flex h-9 max-w-sm flex-1 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground hover:bg-accent/40"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Tìm task, note, goal…</span>
        <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Badge variant="warning" className="hidden sm:flex">
          <Zap className="size-3" /> 12 ngày streak
        </Badge>
        <LiveClock className="hidden md:block" />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-[18px] dark:hidden" />
          <Moon className="hidden size-[18px] dark:block" />
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setQuickAddOpen(true)}>
          <Plus className="size-4" /> <span className="hidden sm:inline">Quick Add</span>
        </Button>
      </div>
    </header>
  );
}
