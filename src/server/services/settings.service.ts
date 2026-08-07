import { prisma } from "@/lib/prisma";
import type { UpdateSettingsInput } from "@/lib/validations/settings";

export const settingsService = {
  /** Get the user's settings, creating defaults if missing. */
  async get(userId: string) {
    return prisma.settings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  update(userId: string, input: UpdateSettingsInput) {
    const { notifications, ...rest } = input;
    return prisma.settings.update({
      where: { userId },
      data: {
        ...rest,
        ...(notifications ? { notifications } : {}),
      },
    });
  },
};
