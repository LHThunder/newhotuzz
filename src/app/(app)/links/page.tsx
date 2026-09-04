import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { LinksManager } from "@/components/links/links-manager";

export const metadata = { title: "Link — LIFE OS" };

export default async function LinksPage() {
  const user = await ensureUser();
  const links = user
    ? await prisma.bookmark.findMany({
        where: { userId: user.id },
        orderBy: [{ favorite: "desc" }, { createdAt: "desc" }],
        select: { id: true, url: true, title: true, favicon: true, category: true, note: true, favorite: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Link cần thiết</h1>
        <p className="text-sm text-muted-foreground">Lưu và phân nhóm những đường dẫn hay dùng.</p>
      </div>
      <LinksManager links={links} />
    </div>
  );
}
