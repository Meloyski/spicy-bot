import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
import type { SpicyCommand } from '../types';
dotenv.config();

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('bungie-link')
    .setDescription('Verify your Bungie ID and get your server role.')
    .addStringOption((option) =>
      option
        .setName('bungieid')
        .setDescription('Your Bungie ID (e.g., Username#0000)')
        .setRequired(true)
    ),
  async execute(interaction) {
    console.log(`[COMMAND TRIGGERED] bungie-link executed by ${interaction.user.tag}.`);

    const bungieId = interaction.options.getString('bungieid', true);
    const apiKey = process.env.BUNGIE_API_KEY;

    const bungieIdPattern = /^.+#\d{4,}$/;
    if (!bungieIdPattern.test(bungieId)) {
      await interaction.reply({
        content: 'Invalid Bungie ID format. Please use `Name#Code` (e.g., Username#0000).',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const [bungieName, bungieCode] = bungieId.split('#');

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      console.log('[STEP 1] Calling Bungie API...');
      const response = await axios.post(
        'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/',
        { displayName: bungieName, displayNameCode: parseInt(bungieCode) },
        {
          headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );
      console.log('[STEP 2] Bungie API responded.');

      if (response.data.Response.length === 0) {
        await interaction.editReply({
          content: 'No player found with that Bungie ID. Please double-check your input.',
        });
        return;
      }

      const membershipId = response.data.Response[0].membershipId;

      const poblanoRole = await interaction.guild?.roles.fetch(process.env.POBLANO ?? '');
      const spicyFamilyRole = await interaction.guild?.roles.fetch(process.env.SPICYFAMILY ?? '');

      if (!poblanoRole || !spicyFamilyRole) {
        await interaction.editReply({
          content: 'An error occurred: Unable to fetch required roles. Please contact @Mod for assistance.',
        });
        return;
      }

      const guildMember = await interaction.guild?.members.fetch(interaction.user.id);
      if (guildMember) {
        await guildMember.roles.remove(poblanoRole);
        await guildMember.roles.add(spicyFamilyRole);
      }

      await interaction.editReply({
        content: `✅ Bungie ID verified!\n\n**Bungie ID:** ${bungieId}\n**Membership ID:** ${membershipId}`,
      });
    } catch (error) {
      console.error('[ERROR]', error);
      await interaction.editReply({
        content: 'An error occurred while processing your Bungie ID. Please contact @Mod for assistance.',
      });
    }
  },
};

export default command;
