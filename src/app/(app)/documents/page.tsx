import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createAdminClient, DOCS_BUCKET } from "@/lib/supabase/admin";
import { DocsManager } from "@/components/docs/docs-manager";

export const metadata = { title: "Tài liệu & giấy tờ — LIFE OS" };

export default async function DocumentsPage() {
  const user = await ensureUser();

  const [folders, documents] = user
    ? await Promise.all([
        prisma.docFolder.findMany({ where: { userId: user.id }, orderBy: { name: "asc" }, include: { _count: { select: { documents: true } } } }),
        prisma.document.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      ])
    : [[], []];

  // Batch-sign URLs so images render as thumbnails and files open on click.
  const urlMap: Record<string, string> = {};
  if (documents.length) {
    const paths = documents.map((d) => d.path);
    const { data } = await createAdminClient().storage.from(DOCS_BUCKET).createSignedUrls(paths, 3600);
    for (const item of data ?? []) if (item.signedUrl && item.path) urlMap[item.path] = item.signedUrl;
  }

  const docs = documents.map((d) => ({
    id: d.id, name: d.name, mime: d.mime, size: d.size, folderId: d.folderId,
    createdAt: d.createdAt.toISOString(), url: urlMap[d.path] ?? null,
  }));
  const folderList = folders.map((f) => ({ id: f.id, name: f.name, count: f._count.documents }));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tài liệu & giấy tờ</h1>
        <p className="text-sm text-muted-foreground">Tải ảnh và tài liệu lên, sắp vào các mục bạn tự tạo. Lưu riêng tư, mã hoá trên máy chủ.</p>
      </div>
      <DocsManager folders={folderList} documents={docs} />
    </div>
  );
}
