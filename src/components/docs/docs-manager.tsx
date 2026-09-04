"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderPlus, Folder, FolderOpen, Upload, Loader2, Trash2, ExternalLink,
  FileText, FileImage, FileSpreadsheet, File as FileIcon, Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createFolder, deleteFolder, uploadDocument, deleteDocument, moveDocument } from "@/server/actions/docs";

type Folder = { id: string; name: string; count: number };
type Doc = { id: string; name: string; mime: string; size: number; folderId: string | null; createdAt: string; url: string | null };

const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

function FileGlyph({ mime, className }: { mime: string; className?: string }) {
  if (mime.startsWith("image/")) return <FileImage className={className} />;
  if (mime === "application/pdf") return <FileText className={className} />;
  if (/sheet|excel|csv/.test(mime)) return <FileSpreadsheet className={className} />;
  if (/word|document/.test(mime)) return <FileText className={className} />;
  return <FileIcon className={className} />;
}

export function DocsManager({ folders, documents }: { folders: Folder[]; documents: Doc[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState<string>("all"); // "all" | "none" | folderId
  const [newFolder, setNewFolder] = useState("");
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const visible = documents.filter((d) => sel === "all" ? true : sel === "none" ? d.folderId === null : d.folderId === sel);
  const uploadFolderId = sel === "all" || sel === "none" ? "" : sel;
  const uncategorized = documents.filter((d) => d.folderId === null).length;

  async function addFolder() {
    if (!newFolder.trim()) return;
    setAdding(true);
    const res = await createFolder(newFolder);
    setAdding(false);
    if (!res.ok) { setErr(res.error); return; }
    setNewFolder(""); setErr(""); router.refresh();
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErr(""); setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      if (uploadFolderId) fd.set("folderId", uploadFolderId);
      const res = await uploadDocument(fd);
      if (!res.ok) setErr(`${file.name}: ${res.error}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function removeFolder(f: Folder) {
    if (!confirm(`Xoá mục “${f.name}” và ${f.count} tài liệu bên trong?`)) return;
    await deleteFolder(f.id);
    if (sel === f.id) setSel("all");
    router.refresh();
  }

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      {/* Folders */}
      <div className="space-y-1">
        <FolderRow active={sel === "all"} onClick={() => setSel("all")} icon={Layers} label="Tất cả" count={documents.length} />
        <FolderRow active={sel === "none"} onClick={() => setSel("none")} icon={Folder} label="Chưa phân loại" count={uncategorized} />
        <div className="my-2 border-t border-border" />
        {folders.map((f) => (
          <div key={f.id} className="group relative">
            <FolderRow active={sel === f.id} onClick={() => setSel(f.id)} icon={sel === f.id ? FolderOpen : Folder} label={f.name} count={f.count} />
            <button onClick={() => removeFolder(f)} title="Xoá mục"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-1 pt-2">
          <Input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFolder()} placeholder="Mục mới…" className="h-9" />
          <Button size="icon" className="size-9 shrink-0" onClick={addFolder} disabled={adding || !newFolder.trim()}>
            {adding ? <Loader2 className="size-4 animate-spin" /> : <FolderPlus className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{visible.length} tài liệu {uploadFolderId && "· tải lên vào mục này"}</p>
          <input ref={fileRef} type="file" multiple hidden accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
            onChange={(e) => onFiles(e.target.files)} />
          <Button size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Tải lên
          </Button>
        </div>
        {err && <p className="text-xs text-destructive">{err}</p>}

        {visible.length === 0 ? (
          <button onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border py-16 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
            <Upload className="size-8" />
            <p className="text-sm">Bấm để tải ảnh / tài liệu lên</p>
            <p className="text-xs">Ảnh, PDF, Word, Excel… tối đa 25MB</p>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((d) => <DocCard key={d.id} doc={d} folders={folders} onChange={() => router.refresh()} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function FolderRow({ active, onClick, icon: Icon, label, count }: { active: boolean; onClick: () => void; icon: typeof Folder; label: string; count: number }) {
  return (
    <button onClick={onClick} className={cn(
      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 pr-8 text-sm transition-colors",
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
    )}>
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </button>
  );
}

function DocCard({ doc, folders, onChange }: { doc: Doc; folders: Folder[]; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const isImage = doc.mime.startsWith("image/");

  async function remove() {
    if (busy || !confirm(`Xoá “${doc.name}”?`)) return;
    setBusy(true);
    await deleteDocument(doc.id);
    setBusy(false);
    onChange();
  }
  async function move(folderId: string) {
    await moveDocument(doc.id, folderId || null);
    onChange();
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-border">
      <a href={doc.url ?? "#"} target="_blank" rel="noopener noreferrer"
        className="flex aspect-[4/3] items-center justify-center bg-muted/50">
        {isImage && doc.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={doc.name} className="size-full object-cover" />
        ) : (
          <FileGlyph mime={doc.mime} className="size-10 text-muted-foreground" />
        )}
      </a>
      <div className="space-y-1.5 p-2">
        <p className="truncate text-xs font-medium" title={doc.name}>{doc.name}</p>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{fmtSize(doc.size)}</span>
          <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" title="Mở" className="hover:text-foreground"><ExternalLink className="size-3.5" /></a>}
            <button onClick={remove} disabled={busy} title="Xoá" className="hover:text-destructive">
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </button>
          </div>
        </div>
        {folders.length > 0 && (
          <select value={doc.folderId ?? ""} onChange={(e) => move(e.target.value)}
            className="w-full rounded border border-border bg-transparent px-1 py-0.5 text-[10px] text-muted-foreground outline-none">
            <option value="" className="bg-background">Chưa phân loại</option>
            {folders.map((f) => <option key={f.id} value={f.id} className="bg-background">{f.name}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
