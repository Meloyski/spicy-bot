import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('simulateleave')
    .setDescription('Simulates a member leaving the server for testing purposes.')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to simulate leaving.').setRequired(false)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    console.log('Command executed: /simulateleave');

    const user = interaction.options.getUser('user') ?? interaction.user;
    console.log(`User resolved: ${user.username} (${user.id})`);

    const member = interaction.guild?.members.cache.get(user.id);
    console.log(
      member
        ? `Member found in guild: ${member.user.username} (${member.id})`
        : 'Member not found in guild.'
    );

    if (!member) {
      console.log('Replying with: Member not found in the server.');
      await interaction.reply({ content: 'Member not found in the server.', flags: MessageFlags.Ephemeral });
      return;
    }

    console.log("Emitting 'guildMemberRemove' event...");
    interaction.client.emit('guildMemberRemove', member);

    await interaction.reply({ content: `Simulated ${user.username} leaving the server.`, flags: MessageFlags.Ephemeral });
  },
};

export default command;
