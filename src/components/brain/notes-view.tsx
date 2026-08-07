"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/tracker/delete-button";
import { updateNote } from "@/server/actions/item";
import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

type Note = { id: string; title: string; content: string; kind: string };

const kinds = [
  { key: "note", label: "Ghi chú" },
  { key: "idea", label: "Ý tưởng" },
  { key: "quote", label: "Trích dẫn" },
  { key: "learning", label: "Học được" },
  { key: "reference", label: "Tham khảo" },
];
const kindLabel: Record<string, string> = Object.fromEntries(kinds.map((k) => [k.key, k.label]));

export function NotesView({ notes }: { notes: Note[] }) {
  const [q, setQ] = useState("");
  const filtered = notes.filter((n) =>
    (n.title + " " + n.content).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm ghi chú…" className="pl-9" />
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={Brain} title="Chưa có ghi chú" description="Lưu ý tưởng đầu tiên ở trên." />
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy ghi chú nào.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((n) => <NoteItem key={n.id} note={n} />)}
        </div>
      )}
    </div>
  );
}

function NoteItem({ note }: { note: Note }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const save = async (data: Parameters<typeof updateNote>[1]) => { await updateNote(note.id, data); router.refresh(); };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
            <p className="truncate font-medium leading-snug">{note.title}</p>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => setOpen(!open)}><ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} /></button>
            <DeleteButton type="note" id={note.id} />
          </div>
        </div>

        {!open && note.content && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{note.content}</p>}
        {!open && <p className="mt-2 text-[11px] text-muted-foreground/70">{kindLabel[note.kind] ?? note.kind}</p>}

        {open && (
          <div className="mt-2 space-y-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => title !== note.title && save({ title })} className="h-9 font-medium" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} onBlur={() => content !== note.content && save({ content })}
              placeholder="Nội dung…" rows={4} className="w-full resize-none rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <div className="flex flex-wrap gap-1">
              {kinds.map((k) => (
                <button key={k.key} onClick={() => save({ kind: k.key })}
                  className={cn("rounded-lg px-2 py-0.5 text-[11px] transition-colors", note.kind === k.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
