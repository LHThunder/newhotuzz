import {
  LayoutDashboard,
  CheckSquare,
  Target,
  FolderKanban,
  Repeat,
  BookOpen,
  Brain,
  Wallet,
  HeartPulse,
  GraduationCap,
  Library,
  Clapperboard,
  BarChart3,
  Trophy,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: string; // css var name for module color
  shortcut?: string;
};

export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [
      { label: "Mission Control", href: "/", icon: LayoutDashboard, shortcut: "G D" },
      { label: "AI Assistant", href: "/assistant", icon: Sparkles },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Làm việc",
    items: [
      { label: "Tasks", href: "/tasks", icon: CheckSquare, accent: "--accent-task", shortcut: "G T" },
      { label: "Goals", href: "/goals", icon: Target, accent: "--accent-goal" },
      { label: "Projects", href: "/projects", icon: FolderKanban },
    ],
  },
  {
    title: "Bản thân",
    items: [
      { label: "Habits", href: "/habits", icon: Repeat, accent: "--accent-habit", shortcut: "G H" },
      { label: "Journal", href: "/journal", icon: BookOpen },
      { label: "Second Brain", href: "/brain", icon: Brain, accent: "--accent-brain" },
      { label: "Health", href: "/health", icon: HeartPulse, accent: "--accent-health" },
    ],
  },
  {
    title: "Tài chính & Học tập",
    items: [
      { label: "Finance", href: "/finance", icon: Wallet, accent: "--accent-finance" },
      { label: "Learning", href: "/learning", icon: GraduationCap, accent: "--accent-learning" },
      { label: "Books", href: "/books", icon: Library },
      { label: "Movies", href: "/movies", icon: Clapperboard },
    ],
  },
  {
    title: "Động lực",
    items: [
      { label: "Gamification", href: "/gamification", icon: Trophy },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const flatNav = navGroups.flatMap((g) => g.items);
