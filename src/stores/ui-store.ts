import { create } from "zustand";

type QuickAddKind = "task" | "habit" | "goal" | "note";

type UIState = {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  quickAddOpen: boolean;
  quickAddKind: QuickAddKind;
  mobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  openQuickAdd: (kind?: QuickAddKind) => void;
  setMobileMenuOpen: (open: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  quickAddOpen: false,
  quickAddKind: "task",
  mobileMenuOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen }),
  openQuickAdd: (kind = "task") => set({ quickAddOpen: true, quickAddKind: kind }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
