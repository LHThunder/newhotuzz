"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";

export function GoalsHeader() {
  const { openQuickAdd } = useUIStore();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground">Từ tầm nhìn đến hành động mỗi ngày.</p>
      </div>
      <Button className="gap-1.5" onClick={() => openQuickAdd("goal")}>
        <Plus className="size-4" /> Mục tiêu mới
      </Button>
    </div>
  );
}

export function AddGoalButton() {
  const { openQuickAdd } = useUIStore();
  return (
    <Button onClick={() => openQuickAdd("goal")}>
      <Plus className="size-4" /> Thêm mục tiêu
    </Button>
  );
}
