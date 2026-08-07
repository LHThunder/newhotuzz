import { Library } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createBook } from "@/server/actions/tracker";
import { BookItem } from "@/components/tracker/book-item";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Books — LIFE OS" };

export default async function BooksPage() {
  const user = await ensureUser();
  const books = user
    ? await prisma.book.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Books</h1>
        <p className="text-sm text-muted-foreground">Theo dõi sách bạn đang đọc.</p>
      </div>

      <InlineAdd action={createBook} placeholder="Tên sách mới…" />

      {books.length === 0 ? (
        <EmptyState icon={Library} title="Chưa có sách" description="Thêm cuốn sách đầu tiên ở trên." />
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <BookItem key={b.id} book={{ id: b.id, title: b.title, author: b.author, status: b.status, rating: b.rating }} />
          ))}
        </div>
      )}
    </div>
  );
}
