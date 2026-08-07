"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createJournalEntry } from "@/server/actions/journal";
import { cn } from "@/lib/utils";

const moods = ["😞", "😕", "😐", "🙂", "😄"];

export function JournalComposer() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(0);
  const [pending, setPending] = useState(false);

  async function save() {
    if (!content.trim() || pending) return;
    setPending(true);
    const res = await createJournalEntry({ content, mood: mood || undefined });
    setPending(false);
    if (res.ok) { setContent(""); setMood(0); router.refresh(); }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hôm nay của bạn thế nào?"
          rows={4}
          className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Tâm trạng:</span>
            {moods.map((m, i) => (
              <button key={i} onClick={() => setMood(i + 1)}
                className={cn("grid size-8 place-items-center rounded-lg text-lg transition-all", mood === i + 1 ? "scale-110 bg-primary/15 ring-1 ring-primary/40" : "opacity-50 hover:opacity-100")}>
                {m}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={save} disabled={!content.trim() || pending} className="gap-1.5">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Lưu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
