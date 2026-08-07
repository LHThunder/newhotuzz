import { HeartPulse } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={HeartPulse}
      title="Health"
      description="Theo dõi giấc ngủ, tập luyện, calo, cân nặng, nước, nhịp tim, thiền & số bước."
      features={["Sleep", "Workout", "Calories", "Weight", "Water", "Heart Rate", "Steps"]}
    />
  );
}
