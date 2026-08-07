import { Library } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={Library}
      title="Book Tracker"
      description="Theo dõi đọc sách: tiến độ, highlight, quote, rating & review."
      features={["Tiến độ", "Highlights", "Quotes", "Rating", "Review"]}
    />
  );
}
