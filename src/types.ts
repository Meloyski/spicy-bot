import type { ChatInputCommandInteraction, Collection, SlashCommandBuilder } from 'discord.js';

export interface SpicyCommand {
  data: Pick<SlashCommandBuilder, 'name' | 'toJSON'>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, SpicyCommand>;
  }
}
