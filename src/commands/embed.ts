import { SlashCommandBuilder, EmbedBuilder, TextChannel } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('_embed')
    .setDescription('Add an Embed as Spicy')
    .addStringOption((option) =>
      option.setName('title').setDescription('Add a Title to the Embed').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('Add a Description to the Embed')
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('Add a Message before your Embed')
    ),
  async execute(interaction) {
    const embedTitle = interaction.options.getString('title', true);
    const embedDescription = interaction.options.getString('description');
    const embedMessage = interaction.options.getString('message');

    const spicyEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(embedTitle)
      .setDescription(embedDescription);

    interaction.deferReply();
    await (interaction.channel as TextChannel)?.send({ content: embedMessage ?? undefined, embeds: [spicyEmbed] });
    interaction.deleteReply();
  },
};

export default command;
