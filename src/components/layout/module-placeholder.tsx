import Link from "next/link";
import { ArrowLeft, Construction, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModulePlaceholder({
  title,
  description,
  icon: Icon = Construction,
  features = [],
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="glass ring-hairline animate-fade-up rounded-2xl p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>

        {features.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {features.map((f) => (
              <span key={f} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        )}

        <Button asChild variant="glass" className="mt-7">
          <Link href="/"><ArrowLeft className="size-4" /> Về Mission Control</Link>
        </Button>
      </div>
    </div>
  );
}
