"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result = { ok: true } | { ok: false; error: string };

/** A single-field add bar wired to a server action. */
export function InlineAdd({
  action,
  placeholder,
  button = "Thêm",
}: {
  action: (value: string) => Promise<Result>;
  placeholder: string;
  button?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const v = value.trim();
    if (!v || pending) return;
    setPending(true);
    setError(null);
    const res = await action(v);
    setPending(false);
    if (!res.ok) { setError(res.error); return; }
    setValue("");
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          className="h-10"
        />
        <Button onClick={submit} disabled={!value.trim() || pending} className="shrink-0 gap-1.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} {button}
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
