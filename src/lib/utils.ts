import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Khuya rồi";
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

/** Format an amount in any currency, locale-aware. */
export function formatMoney(n: number, currency = "VND", locale = "vi-VN") {
  // Zero-decimal currencies (VND, JPY) shouldn't show cents.
  const zeroDecimal = currency === "VND" || currency === "JPY";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(n);
}

/** Back-compat helper. */
export function formatVND(n: number) {
  return formatMoney(n, "VND", "vi-VN");
}

export function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
