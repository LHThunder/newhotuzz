import { ListTodo } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createList } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { ListCard } from "@/components/collections/list-card";

export const metadata = { title: "Lists — LIFE OS" };

export default async function ListsPage() {
  const user = await ensureUser();
  const lists = user
    ? await prisma.list.findMany({
        where: { userId: user.id },
        include: { items: { orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lists</h1>
        <p className="text-sm text-muted-foreground">Danh sách linh hoạt: mua sắm, wishlist, du lịch, nhạc, đồ đạc…</p>
      </div>

      <InlineAdd action={createList} placeholder="Tên danh sách mới (vd Đi chợ, Wishlist, Nơi muốn đến…)" button="Tạo" />

      {lists.length === 0 ? (
        <EmptyState icon={ListTodo} title="Chưa có danh sách" description="Tạo danh sách đầu tiên ở trên." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((l) => (
            <ListCard key={l.id} list={{ id: l.id, name: l.name, emoji: l.emoji, items: l.items.map((i) => ({ id: i.id, title: i.title, done: i.done })) }} />
          ))}
        </div>
      )}
    </div>
  );
}
