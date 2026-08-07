// Shared config for the Settings module.

/** Accent colors — key → HSL triplet applied to --primary / --ring. */
export const accentColors: Record<string, { label: string; hsl: string; dark: string }> = {
  violet: { label: "Tím", hsl: "258 90% 66%", dark: "258 90% 70%" },
  blue:   { label: "Xanh dương", hsl: "217 91% 60%", dark: "217 91% 65%" },
  emerald:{ label: "Xanh lá", hsl: "160 84% 39%", dark: "160 74% 50%" },
  amber:  { label: "Cam", hsl: "32 95% 52%", dark: "32 95% 60%" },
  rose:   { label: "Hồng", hsl: "340 82% 60%", dark: "340 82% 66%" },
  sky:    { label: "Xanh biển", hsl: "199 89% 52%", dark: "199 89% 60%" },
};

export type AccentKey = keyof typeof accentColors;

export const languages = [
  { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { key: "fr", label: "Français", flag: "🇫🇷" },
  { key: "en", label: "English", flag: "🇬🇧" },
];

/** Selectable display currencies. */
export const currencies = [
  { key: "EUR", label: "Euro", symbol: "€" },
  { key: "USD", label: "US Dollar", symbol: "$" },
  { key: "GBP", label: "Bảng Anh", symbol: "£" },
  { key: "VND", label: "Việt Nam Đồng", symbol: "₫" },
  { key: "JPY", label: "Yên Nhật", symbol: "¥" },
];

export const currencySymbol: Record<string, string> = Object.fromEntries(
  currencies.map((c) => [c.key, c.symbol]),
);

/** Maps a UI language to an Intl locale for number/date formatting. */
export const localeFor: Record<string, string> = {
  vi: "vi-VN",
  fr: "fr-FR",
  en: "en-GB",
};

export const timezones = [
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
];

export const themes = [
  { key: "light", label: "Sáng", emoji: "☀️" },
  { key: "dark", label: "Tối", emoji: "🌙" },
  { key: "system", label: "Hệ thống", emoji: "💻" },
];
