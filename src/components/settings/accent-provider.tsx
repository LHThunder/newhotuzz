"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { accentColors, type AccentKey } from "@/lib/settings-config";

/** Applies an accent color to CSS vars. Exported so the form can preview live. */
export function applyAccent(key: string, isDark: boolean) {
  const c = accentColors[key as AccentKey] ?? accentColors.violet;
  const hsl = isDark ? c.dark : c.hsl;
  const root = document.documentElement;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--ring", hsl);
}

/** Reads the stored accent and keeps it applied as the theme changes. */
export function AccentProvider({ accent }: { accent: string }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    applyAccent(accent, resolvedTheme === "dark");
  }, [accent, resolvedTheme]);

  return null;
}
