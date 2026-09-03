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
  CalendarClock,
  ClipboardCheck,
  CalendarRange,
  ListTodo,
  Dices,
  Users,
  Award,
  Lightbulb,
  UtensilsCrossed,
  Sprout,
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
      { label: "Mission Control", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
      { label: "AI Assistant", href: "/assistant", icon: Sparkles },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Kế hoạch",
    items: [
      { label: "Weekly Planning", href: "/weekly-planning", icon: CalendarClock },
      { label: "Weekly Review", href: "/weekly-review", icon: ClipboardCheck },
      { label: "Monthly Review", href: "/monthly-review", icon: CalendarRange },
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
      { label: "Ideas", href: "/ideas", icon: Lightbulb },
      { label: "Personal Growth", href: "/personal-growth", icon: Sprout },
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
    title: "Bộ sưu tập",
    items: [
      { label: "Lists", href: "/lists", icon: ListTodo },
      { label: "Board Games", href: "/board-games", icon: Dices },
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Achievements", href: "/achievements", icon: Award },
      { label: "Food & Recipes", href: "/food", icon: UtensilsCrossed },
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
