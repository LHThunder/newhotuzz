"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Command, Plus, LogOut } from "lucide-react";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, setCommandOpen, setQuickAddOpen } = useUIStore();

  const close = () => setMobileMenuOpen(false);

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="glass-strong absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col gap-1 border-r px-3 py-4"
          >
            {/* Brand + close */}
            <div className="flex items-center gap-2.5 px-2 pb-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
                <Sparkles className="size-5" />
              </div>
              <div className="flex-1 leading-tight">
                <p className="text-sm font-semibold tracking-tight">LIFE OS</p>
                <p className="text-[11px] text-muted-foreground">Mission Control</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8" onClick={close}><X className="size-4" /></Button>
            </div>

            {/* Search + quick add */}
            <div className="flex gap-2 px-1 pb-2">
              <Button variant="glass" size="sm" className="flex-1 justify-start gap-2 text-muted-foreground"
                onClick={() => { close(); setCommandOpen(true); }}>
                <Command className="size-3.5" /> Tìm kiếm
              </Button>
              <Button size="icon" className="size-8" onClick={() => { close(); setQuickAddOpen(true); }}>
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Full nav */}
            <nav className="flex-1 space-y-4 overflow-y-auto px-1 pt-1">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{group.title}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link key={item.href} href={item.href} onClick={close}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors",
                            active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                          )}>
                          <item.icon className="size-[18px] shrink-0" style={item.accent ? { color: `hsl(var(${item.accent}))` } : undefined} />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Profile */}
            <div className="mt-2 flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="size-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-500" />
              <div className="flex-1 leading-tight">
                <p className="text-xs font-medium">Tùng</p>
                <p className="text-[11px] text-muted-foreground">Level 12 · 4,820 XP</p>
              </div>
              <Link href="/login" onClick={close} className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground" title="Đăng xuất">
                <LogOut className="size-4" />
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
