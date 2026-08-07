import { Clapperboard } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={Clapperboard}
      title="Movie Tracker"
      description="Theo dõi phim & series: watchlist, lịch sử xem, rating & review."
      features={["Watchlist", "History", "Rating", "Review"]}
    />
  );
}
