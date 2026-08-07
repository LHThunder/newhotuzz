import { FolderKanban } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      icon={FolderKanban}
      title="Projects"
      description="Quản lý dự án cá nhân: Startup, Freelance, Blog, Youtube, Học AI, Đọc sách…"
      features={["Task rollup", "Progress", "Timeline", "Liên kết Goals"]}
    />
  );
}
