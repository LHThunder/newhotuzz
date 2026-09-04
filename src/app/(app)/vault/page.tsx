import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { VaultManager } from "@/components/vault/vault-manager";

export const metadata = { title: "Mật khẩu — LIFE OS" };

export default async function VaultPage() {
  const user = await ensureUser();
  const rows = user
    ? await prisma.credential.findMany({
        where: { userId: user.id },
        orderBy: [{ favorite: "desc" }, { label: "asc" }],
        select: { id: true, label: true, username: true, url: true, category: true, note: true, favorite: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mật khẩu</h1>
        <p className="text-sm text-muted-foreground">Kho mật khẩu cá nhân — mã hoá AES-256 khi lưu, chỉ hiện khi bạn bấm.</p>
      </div>
      <VaultManager credentials={rows} />
    </div>
  );
}
