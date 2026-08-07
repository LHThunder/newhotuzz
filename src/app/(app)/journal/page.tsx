import { BookOpen } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={BookOpen}
      title="Journal"
      description="Nhật ký đa phương tiện với AI summary & reflection."
      features={["Text", "Mood", "Images", "Voice", "Location", "AI Summary", "AI Reflection"]}
    />
  );
}
