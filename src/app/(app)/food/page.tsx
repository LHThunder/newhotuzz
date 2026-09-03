import { UtensilsCrossed } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/server/services/user.service";
import { createRecipe } from "@/server/actions/collections";
import { InlineAdd } from "@/components/ui/inline-add";
import { EmptyState } from "@/components/ui/empty-state";
import { RecipeCard } from "@/components/collections/recipe-card";

export const metadata = { title: "Food & Recipes — LIFE OS" };

export default async function FoodPage() {
  const user = await ensureUser();
  const recipes = user
    ? await prisma.recipe.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Food & Recipes</h1>
        <p className="text-sm text-muted-foreground">Công thức nấu ăn yêu thích.</p>
      </div>

      <InlineAdd action={createRecipe} placeholder="Tên món / công thức…" />

      {recipes.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="Chưa có công thức" description="Thêm món đầu tiên ở trên." />
      ) : (
        <div className="space-y-2">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={{ id: r.id, name: r.name, category: r.category, ingredients: r.ingredients, instructions: r.instructions, rating: r.rating, favorite: r.favorite }} />
          ))}
        </div>
      )}
    </div>
  );
}
