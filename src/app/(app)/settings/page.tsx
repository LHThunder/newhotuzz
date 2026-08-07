import { SettingsForm } from "@/components/settings/settings-form";
import { ensureUser } from "@/server/services/user.service";
import { settingsService } from "@/server/services/settings.service";

export const metadata = { title: "Settings — LIFE OS" };

const defaults = {
  theme: "dark", accentColor: "violet", language: "vi", currency: "VND", location: null,
  timezone: "Asia/Ho_Chi_Minh", weekStartsOn: 1, waterGoalMl: 2500,
  sleepGoalMin: 480, focusGoalMin: 120, notifications: {},
};

export default async function SettingsPage() {
  const user = await ensureUser();
  const settings = user ? await settingsService.get(user.id) : defaults;

  return <SettingsForm initial={settings as typeof defaults} />;
}
