"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus, Trash2, Loader2, Eye, EyeOff, Copy, Check, ExternalLink, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createCredential, deleteCredential, updateCredential, revealCredential } from "@/server/actions/vault";

type Cred = { id: string; label: string; username: string | null; url: string | null; category: string | null; note: string | null; favorite: boolean };

export function VaultManager({ credentials }: { credentials: Cred[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ label: "", username: "", secret: "", url: "", category: "", note: "" });

  const groups = Object.entries(
    credentials.reduce<Record<string, Cred[]>>((acc, c) => {
      const k = c.category?.trim() || "Khác";
      (acc[k] ??= []).push(c);
      return acc;
    }, {}),
  ).sort(([a], [b]) => (a === "Khác" ? 1 : b === "Khác" ? -1 : a.localeCompare(b)));

  async function add() {
    setErr(""); setBusy(true);
    const res = await createCredential(form);
    setBusy(false);
    if (!res.ok) { setErr(res.error); return; }
    setForm({ label: "", username: "", secret: "", url: "", category: "", note: "" });
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{credentials.length} mật khẩu · mã hoá AES-256</p>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen((v) => !v)}><Plus className="size-4" /> Thêm</Button>
      </div>

      {open && (
        <Card>
          <CardHeader><CardTitle>Mật khẩu mới</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Dịch vụ (Gmail, Facebook…)" />
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Nhóm (Cá nhân, Ngân hàng…)" />
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Email / tên đăng nhập" />
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Đường dẫn (tuỳ chọn)" />
            </div>
            <Input type="password" value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} placeholder="Mật khẩu" autoComplete="new-password" />
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú (tuỳ chọn)" />
            {err && <p className="text-xs text-destructive">{err}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Huỷ</Button>
              <Button size="sm" onClick={add} disabled={busy || !form.label || !form.secret} className="gap-1.5">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Lưu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {credentials.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-10 text-muted-foreground">
          <KeyRound className="size-7" /><p className="mt-2 text-sm">Chưa có mật khẩu nào. Bấm “Thêm”.</p>
        </CardContent></Card>
      ) : (
        groups.map(([cat, items]) => (
          <div key={cat}>
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{cat}</p>
            <div className="space-y-2">
              {items.map((c) => <CredRow key={c.id} cred={c} onChange={() => router.refresh()} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CredRow({ cred, onChange }: { cred: Cred; onChange: () => void }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"user" | "pass" | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (shown) { setShown(false); return; }
    if (secret === null) {
      setLoading(true);
      const res = await revealCredential(cred.id);
      setLoading(false);
      if (!res.ok) return;
      setSecret(res.secret);
    }
    setShown(true);
  }

  async function copy(kind: "user" | "pass") {
    let text = cred.username ?? "";
    if (kind === "pass") {
      if (secret === null) { const res = await revealCredential(cred.id); if (!res.ok) return; setSecret(res.secret); text = res.secret; }
      else text = secret;
    }
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setCopied(kind); setTimeout(() => setCopied(null), 1200); } catch { /* clipboard chặn */ }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    await deleteCredential(cred.id);
    setBusy(false);
    onChange();
  }

  async function star() {
    await updateCredential(cred.id, { favorite: !cred.favorite });
    onChange();
  }

  return (
    <div className="group rounded-xl border border-border p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <KeyRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">{cred.label}</p>
            {cred.url && (
              <a href={cred.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
          {cred.username && <p className="truncate text-xs text-muted-foreground">{cred.username}</p>}
        </div>
        <button onClick={star} title="Ghim" className={cn("opacity-0 group-hover:opacity-100", cred.favorite && "opacity-100")}>
          <Star className={cn("size-4", cred.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
        </button>
        <button onClick={remove} disabled={busy} title="Xoá" className="opacity-0 group-hover:opacity-100">
          {busy ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />}
        </button>
      </div>

      {/* Password row */}
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <code className="flex-1 truncate font-mono text-sm">{shown ? secret : "••••••••••"}</code>
        <button onClick={toggle} title={shown ? "Ẩn" : "Hiện"} className="text-muted-foreground hover:text-foreground">
          {loading ? <Loader2 className="size-4 animate-spin" /> : shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <button onClick={() => copy("pass")} title="Sao chép mật khẩu" className="text-muted-foreground hover:text-foreground">
          {copied === "pass" ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </button>
      </div>
      {cred.note && <p className="mt-1.5 px-1 text-xs text-muted-foreground">{cred.note}</p>}
    </div>
  );
}
