"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addListItem, toggleListItem, deleteListItem, deleteList } from "@/server/actions/collections";
import { cn } from "@/lib/utils";

type Item = { id: string; title: string; done: boolean };
type List = { id: string; name: string; emoji: string | null; items: Item[] };

export function ListCard({ list }: { list: List }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const done = list.items.filter((i) => i.done).length;

  async function run(fn: () => Promise<unknown>) { setBusy(true); await fn(); setBusy(false); router.refresh(); }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>{list.emoji ?? "📋"}</span> {list.name}
          <span className="text-xs font-normal text-muted-foreground">{done}/{list.items.length}</span>
        </CardTitle>
        <button onClick={() => run(() => deleteList(list.id))} disabled={busy} title="Xoá danh sách">
          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </CardHeader>
      <CardContent className="space-y-1">
        {list.items.map((it) => (
          <div key={it.id} className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-accent/20">
            <button onClick={() => run(() => toggleListItem(it.id))}
              className={cn("grid size-4 shrink-0 place-items-center rounded border transition-all", it.done ? "border-transparent bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
              {it.done && <Check className="size-3" />}
            </button>
            <span className={cn("flex-1 text-sm", it.done && "text-muted-foreground line-through")}>{it.title}</span>
            <button onClick={() => run(() => deleteListItem(it.id))} className="opacity-0 group-hover:opacity-100">
              <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { run(() => addListItem(list.id, input.trim())); setInput(""); } }}
            placeholder="+ Thêm mục…"
            className="flex-1 border-b border-border bg-transparent pb-1 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
          />
          {busy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}
