import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={BarChart3}
      title="Analytics"
      description="Dashboard thống kê toàn diện với các chỉ số sức khoẻ cuộc sống."
      features={["Productivity Score", "Focus Score", "Health Score", "Finance Score", "Life Balance", "Consistency"]}
    />
  );
}
