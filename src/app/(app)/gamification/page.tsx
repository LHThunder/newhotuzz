import { Trophy } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={Trophy}
      title="Gamification"
      description="XP, Level, Achievement, Badge & Quests theo ngày/tuần/tháng để duy trì động lực."
      features={["XP & Level", "Achievements", "Badges", "Daily Quest", "Weekly Quest"]}
    />
  );
}
