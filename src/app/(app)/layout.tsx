import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickAdd } from "@/components/layout/quick-add";
import { ensureUser } from "@/server/services/user.service";
import { AccentProvider } from "@/components/settings/accent-provider";

const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Real mode: require a signed-in user and sync them into the DB.
  // Demo mode (no Supabase env): skip auth so the scaffold still runs.
  let accent = "violet";
  if (supabaseConfigured) {
    const user = await ensureUser();
    if (!user) redirect("/login");
    accent = user.settings?.accentColor ?? "violet";
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 pb-24 pt-5 md:px-6 md:pb-8">{children}</main>
      </div>
      <MobileNav />
      <CommandPalette />
      <QuickAdd />
      <AccentProvider accent={accent} />
    </div>
  );
}
