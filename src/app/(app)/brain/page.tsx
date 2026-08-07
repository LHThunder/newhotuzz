import { Brain } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={Brain}
      title="Second Brain"
      description="Quản lý kiến thức: Notes, Ideas, Bookmarks, Quotes với Markdown, backlinks & AI search."
      features={["Markdown", "Backlinks", "Tags", "AI Search", "Bookmarks"]}
    />
  );
}
