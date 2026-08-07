"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTransaction } from "@/server/actions/finance";

export function TxDelete({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => { setBusy(true); await deleteTransaction(id); setBusy(false); router.refresh(); }}
      disabled={busy}
      className="opacity-0 transition-opacity group-hover:opacity-100"
      title="Xoá"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />}
    </button>
  );
}
