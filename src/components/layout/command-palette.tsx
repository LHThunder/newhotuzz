"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Plus,
  Moon,
  Sun,
  Search,
  CornerDownLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { flatNav } from "@/lib/nav";
import { useUIStore } from "@/stores/ui-store";

export function CommandPalette() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { commandOpen, setCommandOpen, setQuickAddOpen } = useUIStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandOpen, setCommandOpen]);

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  if (!commandOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setCommandOpen(false)}
    >
      <Command
        className="glass-strong ring-hairline w-full max-w-xl overflow-hidden rounded-2xl shadow-glass animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Gõ lệnh hoặc tìm kiếm…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            Không có kết quả.
          </Command.Empty>

          <Command.Group heading="Hành động" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            <Item onSelect={() => { setCommandOpen(false); setQuickAddOpen(true); }}>
              <Plus className="size-4 text-primary" /> Thêm nhanh (Task / Note / Habit)
            </Item>
            <Item onSelect={() => { setTheme(theme === "dark" ? "light" : "dark"); }}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              Đổi giao diện sáng / tối
            </Item>
          </Command.Group>

          <Command.Group heading="Điều hướng" className="mt-1 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {flatNav.map((item) => (
              <Item key={item.href} onSelect={() => go(item.href)}>
                <item.icon
                  className="size-4"
                  style={item.accent ? { color: `hsl(var(${item.accent}))` } : undefined}
                />
                {item.label}
              </Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground aria-selected:bg-accent"
    >
      {children}
      <CornerDownLeft className="ml-auto size-3.5 text-muted-foreground opacity-0 group-aria-selected:opacity-100" />
    </Command.Item>
  );
}
