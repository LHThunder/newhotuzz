"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteRecord } from "@/server/actions/item";
import { cn } from "@/lib/utils";

type RecordType = "book" | "movie" | "course" | "project" | "note" | "journal" | "health";

export function DeleteButton({ type, id, className }: { type: RecordType; id: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (busy) return;
    setBusy(true);
    await deleteRecord(type, id);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      title="Xoá"
      className={cn("grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive", className)}
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </button>
  );
}
