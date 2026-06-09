import { SlashCommandBuilder, EmbedBuilder, TextChannel, MessageFlags } from 'discord.js';
import type { SpicyCommand } from '../types';

const rewardImages: Record<string, string> = {
  bundle: 'https://assets.tiltify.com/uploads/reward/image/342732/blob-61cd49d7-722e-43b5-b4c0-89830cee4a07.jpeg',
  emblem: 'https://assets.tiltify.com/uploads/reward/image/342748/blob-f28a571d-5653-432b-a810-7b9ce103d03e.jpeg',
  shader_ghost: 'https://assets.tiltify.com/uploads/reward/image/342733/blob-c341e204-716e-476e-b995-b8e60ac38630.jpeg',
  ship_sparrow: 'https://assets.tiltify.com/uploads/reward/image/342734/blob-60bb63e1-6652-4f49-ad0a-27757fb3b2ad.jpeg',
  sign_of_connection: 'https://assets.tiltify.com/uploads/reward/image/345971/blob-80ce3ee6-d153-4fec-8fb0-006dfa8eeee9.jpeg',
  together_in_contribution: 'https://assets.tiltify.com/uploads/reward/image/342793/blob-7db6aca6-b288-4616-89cf-3df50896f2f6.png',
  shine_triumphant: 'https://assets.tiltify.com/uploads/reward/image/342792/blob-7db6aca6-b288-4616-89cf-3df50896f2f6.png',
  nature_of_truth: 'https://assets.tiltify.com/uploads/reward/image/342791/blob-e3caaa48-3d8a-4506-a96c-e07530e36615.jpeg',
  retro_boy: 'https://assets.tiltify.com/uploads/reward/image/342752/blob-2142180e-0dce-4447-9b32-e937050549d0.png',
};

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('_donation')
    .setDescription('Add a Donation')
    .addStringOption((option) =>
      option.setName('donation').setDescription('Donation amount (example: 25 or 25.00)').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('total').setDescription('SRH total donations (running total)').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('image')
        .setDescription('Select a rewards image')
        .setRequired(true)
        .addChoices(
          { name: 'Bundle', value: 'bundle' },
          { name: 'Emblem', value: 'emblem' },
          { name: 'Shader & Ghost', value: 'shader_ghost' },
          { name: 'Ship & Sparrow', value: 'ship_sparrow' },
          { name: 'Sign of Connection', value: 'sign_of_connection' },
          { name: 'Together in Contribution', value: 'together_in_contribution' },
          { name: 'Shine Triumphant', value: 'shine_triumphant' },
          { name: 'Nature of Truth', value: 'nature_of_truth' },
          { name: 'Retro Boy', value: 'retro_boy' }
        )
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('Optional donor message').setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName('author')
        .setDescription('Select the member to show as the embed author (optional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(0),

  async execute(interaction) {
    const donation = interaction.options.getString('donation', true);
    const total = interaction.options.getString('total', true);
    const message = interaction.options.getString('message');
    const imageChoice = interaction.options.getString('image', true);
    const authorUser = interaction.options.getUser('author');
    const campaignUrl = 'https://tilt.fyi/sfRM6WCm0j';

    const spicyEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`New Donation: $${donation}`)
      .setURL(campaignUrl)
      .addFields(
        { name: 'SRH Total Donations', value: `$${total}`, inline: true },
        { name: '​', value: '​', inline: true },
        { name: '​', value: '​', inline: true }
      );

    if (authorUser) {
      const authorMember = await interaction.guild?.members.fetch(authorUser.id);
      if (authorMember) {
        spicyEmbed.setAuthor({
          name: authorMember.displayName,
          iconURL: authorUser.displayAvatarURL({ size: 128 }),
        });
      }
    }

    if (message && message.trim().length > 0) {
      spicyEmbed.setDescription(message.trim());
    }

    const imageUrl = rewardImages[imageChoice];
    if (imageUrl) {
      spicyEmbed.setThumbnail(imageUrl);
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await (interaction.channel as TextChannel)?.send({ embeds: [spicyEmbed] });
    await interaction.deleteReply();
  },
};

export default command;
