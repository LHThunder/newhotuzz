"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/tracker/stars";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateBook } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type Book = {
  id: string; title: string; author: string | null; status: string;
  rating: number | null; currentPage: number; totalPages: number | null; review: string | null;
};

const cycle = ["reading", "done", "wishlist"];
const statusLabel: Record<string, string> = { reading: "Đang đọc", done: "Đã đọc", wishlist: "Muốn đọc" };
const statusStyle: Record<string, string> = {
  reading: "bg-sky-500/15 text-sky-400", done: "bg-emerald-500/15 text-emerald-400", wishlist: "bg-muted text-muted-foreground",
};

export function BookItem({ book }: { book: Book }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [author, setAuthor] = useState(book.author ?? "");
  const [total, setTotal] = useState(book.totalPages?.toString() ?? "");
  const [review, setReview] = useState(book.review ?? "");

  const next = cycle[(cycle.indexOf(book.status) + 1) % cycle.length];
  const pct = book.totalPages ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)) : 0;

  const save = async (data: Parameters<typeof updateBook>[1]) => { await updateBook(book.id, data); router.refresh(); };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-10 shrink-0 place-items-center rounded bg-muted text-lg">📖</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{book.title}</p>
            {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
            <div className="mt-1.5 flex items-center gap-2">
              <button onClick={() => save({ status: next })} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusStyle[book.status])}>
                {statusLabel[book.status] ?? book.status}
              </button>
              <Stars value={book.rating} onRate={(r) => updateBook(book.id, { rating: r })} />
              {book.totalPages ? <span className="text-[11px] text-muted-foreground">{book.currentPage}/{book.totalPages} tr · {pct}%</span> : null}
            </div>
          </div>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <DeleteButton type="book" id={book.id} />
        </div>

        {book.totalPages ? <Progress value={pct} className="mt-2 h-1.5" indicatorClassName="bg-sky-500" /> : null}

        {open && (
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} onBlur={() => author !== (book.author ?? "") && save({ author })} placeholder="Tác giả" className="h-9 flex-1" />
              <Input inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} onBlur={() => save({ totalPages: Number(total) || 0 })} placeholder="Tổng số trang" className="h-9 w-32" />
            </div>
            {book.totalPages ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Đang ở trang</span>
                <Input key={book.currentPage} inputMode="numeric" defaultValue={book.currentPage}
                  onBlur={(e) => save({ currentPage: Number(e.target.value.replace(/\D/g, "")) || 0 })} className="h-8 w-20" />
                <Button variant="glass" size="sm" onClick={() => save({ currentPage: Math.min(book.totalPages!, book.currentPage + 10) })} className="gap-1"><Plus className="size-3.5" /> 10 trang</Button>
              </div>
            ) : null}
            <textarea value={review} onChange={(e) => setReview(e.target.value)} onBlur={() => review !== (book.review ?? "") && save({ review })}
              placeholder="Cảm nhận / review…" rows={2} className="w-full resize-none rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
