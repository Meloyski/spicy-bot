import { prisma } from '../db';

export function trackUsage(guildId: string, userId: string, command: string): void {
  prisma.usageEvent
    .create({ data: { guildId, userId, command } })
    .catch((err) => console.error(`[trackUsage] Failed to log "${command}":`, err));
}
