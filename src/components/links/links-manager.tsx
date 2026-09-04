"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, Trash2, Loader2, ExternalLink, Copy, Check, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createLink, deleteLink, updateLink } from "@/server/actions/links";

type Link = { id: string; url: string; title: string | null; favicon: string | null; category: string | null; note: string | null; favorite: boolean };

export function LinksManager({ links }: { links: Link[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ url: "", title: "", category: "", note: "" });

  const groups = Object.entries(
    links.reduce<Record<string, Link[]>>((acc, l) => {
      const k = l.category?.trim() || "Khác";
      (acc[k] ??= []).push(l);
      return acc;
    }, {}),
  ).sort(([a], [b]) => (a === "Khác" ? 1 : b === "Khác" ? -1 : a.localeCompare(b)));

  async function add() {
    setErr(""); setBusy(true);
    const res = await createLink(form);
    setBusy(false);
    if (!res.ok) { setErr(res.error); return; }
    setForm({ url: "", title: "", category: "", note: "" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Thêm link</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Dán URL… (vd: figma.com/…)" onKeyDown={(e) => e.key === "Enter" && form.url && add()} />
          <div className="grid gap-2 sm:grid-cols-3">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tên (tuỳ chọn)" />
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Nhóm (Công việc…)" />
            <Button onClick={add} disabled={busy || !form.url} className="gap-1.5">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Lưu link
            </Button>
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
        </CardContent>
      </Card>

      {links.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-10 text-muted-foreground">
          <Link2 className="size-7" /><p className="mt-2 text-sm">Chưa có link nào. Dán URL ở trên.</p>
        </CardContent></Card>
      ) : (
        groups.map(([cat, items]) => (
          <div key={cat}>
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{cat}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((l) => <LinkRow key={l.id} link={l} onChange={() => router.refresh()} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function LinkRow({ link, onChange }: { link: Link; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  let host = link.url;
  try { host = new URL(link.url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }

  async function remove() {
    if (busy) return;
    setBusy(true);
    await deleteLink(link.id);
    setBusy(false);
    onChange();
  }
  async function copy() {
    try { await navigator.clipboard.writeText(link.url); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ }
  }
  async function star() { await updateLink(link.id, { favorite: !link.favorite }); onChange(); }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border p-3">
      {link.favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={link.favicon} alt="" className="size-8 shrink-0 rounded-lg bg-muted object-contain p-1" />
      ) : (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><Link2 className="size-4" /></span>
      )}
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{link.title || host}</p>
        <p className="truncate text-xs text-muted-foreground">{host}</p>
        {link.note && <p className="truncate text-[11px] text-muted-foreground/80">{link.note}</p>}
      </a>
      <button onClick={star} title="Ghim" className={cn("opacity-0 group-hover:opacity-100", link.favorite && "opacity-100")}>
        <Star className={cn("size-4", link.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
      </button>
      <button onClick={copy} title="Sao chép" className="text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100">
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
      </button>
      <a href={link.url} target="_blank" rel="noopener noreferrer" title="Mở" className="text-muted-foreground hover:text-foreground"><ExternalLink className="size-4" /></a>
      <button onClick={remove} disabled={busy} title="Xoá" className="opacity-0 group-hover:opacity-100">
        {busy ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />}
      </button>
    </div>
  );
}
