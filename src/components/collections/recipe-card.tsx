"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, Star, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateRecipe, deleteRecipe } from "@/server/actions/collections";
import { cn } from "@/lib/utils";

type Recipe = { id: string; name: string; category: string | null; ingredients: string | null; instructions: string | null; rating: number | null; favorite: boolean };

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(recipe.category ?? "");
  const [ing, setIng] = useState(recipe.ingredients ?? "");
  const [ins, setIns] = useState(recipe.instructions ?? "");

  const run = async (fn: () => Promise<unknown>) => { await fn(); router.refresh(); };
  const save = (data: Parameters<typeof updateRecipe>[1]) => run(() => updateRecipe(recipe.id, data));

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-lg">🍽️</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{recipe.name}</p>
            <div className="mt-1 flex items-center gap-2">
              {recipe.category && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{recipe.category}</span>}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => save({ rating: i })}>
                    <Star className={cn("size-3.5", (recipe.rating ?? 0) >= i ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => save({ favorite: !recipe.favorite })}>
            <Heart className={cn("size-4", recipe.favorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-muted-foreground"><ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} /></button>
          <button onClick={() => run(() => deleteRecipe(recipe.id))}><Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" /></button>
        </div>

        {open && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <Input value={cat} onChange={(e) => setCat(e.target.value)} onBlur={() => cat !== (recipe.category ?? "") && save({ category: cat })} placeholder="Phân loại (món chính, tráng miệng…)" className="h-9" />
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Nguyên liệu</label>
              <textarea value={ing} onChange={(e) => setIng(e.target.value)} onBlur={() => ing !== (recipe.ingredients ?? "") && save({ ingredients: ing })} rows={3} className="w-full resize-none rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted-foreground">Cách làm</label>
              <textarea value={ins} onChange={(e) => setIns(e.target.value)} onBlur={() => ins !== (recipe.instructions ?? "") && save({ instructions: ins })} rows={4} className="w-full resize-none rounded-lg border border-border bg-transparent p-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
