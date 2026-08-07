"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Stars } from "@/components/tracker/stars";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateBook } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type Book = { id: string; title: string; author: string | null; status: string; rating: number | null };

const cycle = ["reading", "done", "wishlist"];
const statusLabel: Record<string, string> = { reading: "Đang đọc", done: "Đã đọc", wishlist: "Muốn đọc" };
const statusStyle: Record<string, string> = {
  reading: "bg-sky-500/15 text-sky-400", done: "bg-emerald-500/15 text-emerald-400", wishlist: "bg-muted text-muted-foreground",
};

export function BookItem({ book }: { book: Book }) {
  const router = useRouter();
  const next = cycle[(cycle.indexOf(book.status) + 1) % cycle.length];

  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-4">
        <span className="grid h-14 w-10 shrink-0 place-items-center rounded bg-muted text-lg">📖</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{book.title}</p>
          {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
          <div className="mt-1.5 flex items-center gap-2">
            <button
              onClick={async () => { await updateBook(book.id, { status: next }); router.refresh(); }}
              className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors", statusStyle[book.status])}
            >
              {statusLabel[book.status] ?? book.status}
            </button>
            <Stars value={book.rating} onRate={(r) => updateBook(book.id, { rating: r })} />
          </div>
        </div>
        <DeleteButton type="book" id={book.id} />
      </CardContent>
    </Card>
  );
}
