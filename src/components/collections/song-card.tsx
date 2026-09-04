"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, Heart, Music4, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateSong, deleteSong } from "@/server/actions/collections";
import { cn } from "@/lib/utils";

type Song = {
  id: string; title: string; status: string; genre: string | null;
  lyrics: string | null; chords: string | null; audioUrl: string | null; favorite: boolean;
};

const cycle = ["idea", "draft", "finished"];
const label: Record<string, string> = { idea: "Ý tưởng", draft: "Bản nháp", finished: "Hoàn thành" };
const style: Record<string, string> = {
  idea: "bg-muted text-muted-foreground", draft: "bg-amber-500/15 text-amber-400", finished: "bg-emerald-500/15 text-emerald-400",
};

export function SongCard({ song }: { song: Song }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [genre, setGenre] = useState(song.genre ?? "");
  const [audio, setAudio] = useState(song.audioUrl ?? "");
  const [lyrics, setLyrics] = useState(song.lyrics ?? "");
  const [chords, setChords] = useState(song.chords ?? "");
  const next = cycle[(cycle.indexOf(song.status) + 1) % cycle.length];

  const run = async (fn: () => Promise<unknown>) => { await fn(); router.refresh(); };
  const save = (data: Parameters<typeof updateSong>[1]) => run(() => updateSong(song.id, data));

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-sky-500/20 text-lg">🎵</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{song.title}</p>
            <div className="mt-1 flex items-center gap-2">
              <button onClick={() => save({ status: next })} className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", style[song.status])}>
                {label[song.status] ?? song.status}
              </button>
              {song.genre && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{song.genre}</span>}
              {song.audioUrl && (
                <a href={song.audioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[11px] text-primary hover:underline">
                  <Play className="size-3" /> Nghe
                </a>
              )}
            </div>
          </div>
          <button onClick={() => save({ favorite: !song.favorite })}>
            <Heart className={cn("size-4", song.favorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <button onClick={() => run(() => deleteSong(song.id))}><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></button>
        </div>

        {open && (
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              <Input value={genre} onChange={(e) => setGenre(e.target.value)} onBlur={() => genre !== (song.genre ?? "") && save({ genre })} placeholder="Thể loại (ballad, pop…)" className="h-9 flex-1" />
              <Input value={audio} onChange={(e) => setAudio(e.target.value)} onBlur={() => audio !== (song.audioUrl ?? "") && save({ audioUrl: audio })} placeholder="Link bản thu (SoundCloud/Drive…)" className="h-9 flex-1" />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground"><Music4 className="size-3" /> Lời bài hát</label>
              <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} onBlur={() => lyrics !== (song.lyrics ?? "") && save({ lyrics })}
                placeholder="Viết lời ở đây…" rows={8} className="w-full resize-none rounded-lg border border-border bg-transparent p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Hợp âm / ghi chú nhạc</label>
              <textarea value={chords} onChange={(e) => setChords(e.target.value)} onBlur={() => chords !== (song.chords ?? "") && save({ chords })}
                placeholder="[Verse] C  G  Am  F …" rows={3} className="w-full resize-none rounded-lg border border-border bg-transparent p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
