import { SlashCommandBuilder, Events, GuildMember, MessageFlags } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('_mod-simulate-join')
    .setDescription('Simulates a new member joining the server for testing purposes.')
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    interaction.client.emit(Events.GuildMemberAdd, interaction.member as GuildMember);
    await interaction.reply({ content: 'Simulated a new member joining!', flags: MessageFlags.Ephemeral });
  },
};

export default command;
