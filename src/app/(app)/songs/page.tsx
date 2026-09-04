import { Music4 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createSong } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { SongCard } from "@/components/collections/song-card";

export const metadata = { title: "Sáng tác — LIFE OS" };

export default async function SongsPage() {
  const user = await ensureUser();
  const songs = user
    ? await prisma.song.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sáng tác</h1>
        <p className="text-sm text-muted-foreground">Kho bài hát bạn tự viết — lời, hợp âm & bản thu.</p>
      </div>

      <InlineAdd action={createSong} placeholder="Tên bài hát mới…" />

      {songs.length === 0 ? (
        <EmptyState icon={Music4} title="Chưa có bài hát" description="Thêm sáng tác đầu tiên ở trên." />
      ) : (
        <div className="space-y-2">
          {songs.map((s) => (
            <SongCard key={s.id} song={{ id: s.id, title: s.title, status: s.status, genre: s.genre, lyrics: s.lyrics, chords: s.chords, audioUrl: s.audioUrl, favorite: s.favorite }} />
          ))}
        </div>
      )}
    </div>
  );
}
