"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateContact, deleteContact } from "@/server/actions/collections";
import { cn } from "@/lib/utils";

type Contact = { id: string; name: string; relationship: string | null; company: string | null; role: string | null; contact: string | null; notes: string | null };

export function ContactCard({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    relationship: contact.relationship ?? "", company: contact.company ?? "",
    role: contact.role ?? "", contact: contact.contact ?? "", notes: contact.notes ?? "",
  });

  const save = async (patch: Partial<typeof f>) => { await updateContact(contact.id, patch); router.refresh(); };
  const del = async () => { await deleteContact(contact.id); router.refresh(); };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-sm font-semibold text-white">
            {contact.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{contact.name}</p>
            {(contact.relationship || contact.company) && (
              <p className="truncate text-xs text-muted-foreground">
                {[contact.relationship, contact.company].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <button onClick={del}><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></button>
        </div>

        {open && (
          <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
            <Field label="Quan hệ" value={f.relationship} onSave={(v) => { setF({ ...f, relationship: v }); save({ relationship: v }); }} />
            <Field label="Công ty" value={f.company} onSave={(v) => { setF({ ...f, company: v }); save({ company: v }); }} />
            <Field label="Vai trò" value={f.role} onSave={(v) => { setF({ ...f, role: v }); save({ role: v }); }} />
            <Field label="Liên hệ" value={f.contact} onSave={(v) => { setF({ ...f, contact: v }); save({ contact: v }); }} />
            <div className="sm:col-span-2">
              <Field label="Ghi chú" value={f.notes} onSave={(v) => { setF({ ...f, notes: v }); save({ notes: v }); }} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Input value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} className="h-9" />
    </div>
  );
}
