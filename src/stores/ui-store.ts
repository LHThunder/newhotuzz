import { create } from "zustand";

type QuickAddKind = "task" | "habit" | "goal" | "note";

type UIState = {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  quickAddOpen: boolean;
  quickAddKind: QuickAddKind;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  openQuickAdd: (kind?: QuickAddKind) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  quickAddOpen: false,
  quickAddKind: "task",
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen }),
  openQuickAdd: (kind = "task") => set({ quickAddOpen: true, quickAddKind: kind }),
}));
