import { Library, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createBook } from "@/server/actions/tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Books — LIFE OS" };

const statusLabel: Record<string, string> = { reading: "Đang đọc", done: "Đã đọc", wishlist: "Muốn đọc" };

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
            <Card key={b.id}>
              <CardContent className="flex items-center gap-3 pt-4">
                <span className="grid h-14 w-10 shrink-0 place-items-center rounded bg-muted text-lg">📖</span>
                <div className="flex-1">
                  <p className="font-medium">{b.title}</p>
                  {b.author && <p className="text-xs text-muted-foreground">{b.author}</p>}
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{statusLabel[b.status] ?? b.status}</Badge>
                    {b.rating && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-400">
                        <Star className="size-3 fill-amber-400" /> {b.rating}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
