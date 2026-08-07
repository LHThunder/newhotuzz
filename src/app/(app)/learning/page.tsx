import { GraduationCap } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={GraduationCap}
      title="Learning"
      description="Quản lý học tập: courses, books, videos, articles, certificates & lịch ôn tập."
      features={["Courses", "Learning Time", "Certificates", "Review Schedule", "AI Learning Coach"]}
    />
  );
}
