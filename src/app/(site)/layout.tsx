import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          LIFE OS
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">Home</Link>
          <Link href="/about" className="rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">About</Link>
          <ThemeToggle />
          <Link href="/dashboard" className="ml-1 rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground shadow-glow hover:bg-primary/90">
            Enter OS →
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground md:px-8">
        © {new Date().getFullYear()} · Built with LIFE OS
      </footer>
    </div>
  );
}
