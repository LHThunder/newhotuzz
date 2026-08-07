import { HabitsView } from "@/components/habits/habits-view";
import { ensureUser } from "@/server/services/user.service";
import { habitService } from "@/server/services/habit.service";

export const metadata = { title: "Habits — LIFE OS" };

export default async function HabitsPage() {
  const user = await ensureUser();
  const habits = user ? await habitService.listDetailed(user.id) : [];
  return <HabitsView habits={habits} />;
}
