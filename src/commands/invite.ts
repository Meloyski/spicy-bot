import { SlashCommandBuilder } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the Spicy Ramen Discord Invite link'),
  async execute(interaction) {
    await interaction.deferReply();

    const guild = interaction.guild!;
    const boostLevel = guild.premiumTier;
    console.log(`Current boost level: ${boostLevel}`);

    const inviteLink =
      boostLevel === 0 || boostLevel === 1 || boostLevel === 2
        ? 'https://discord.gg/7n5w23q'
        : 'https://discord.gg/spicyramenhouse';

    await interaction.editReply({ content: "Here's the invite link:" });
    await interaction.followUp({ content: inviteLink });
  },
};

export default command;
