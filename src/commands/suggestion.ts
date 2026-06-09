import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('suggestion')
    .setDescription(
      'Have an idea that the server could benefit from? Want to provide some feedback? Do it here.'
    )
    .addBooleanOption((option) =>
      option
        .setName('anonymous')
        .setDescription('Would you like your suggestion/feedback to be anonymous?')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('Give your idea a title.').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('Go more into detail about your idea!').setRequired(true)
    ),
  async execute(interaction) {
    const { guild, user } = interaction;
    const targetChannel =
      guild?.channels.cache.get(process.env.SUGGESTION_ID ?? '') ??
      guild?.channels.cache.find((channel) => channel.name === 'suggestion-box');

    if (!targetChannel || !targetChannel.isTextBased()) {
      await interaction.reply({ content: 'Could not find the target channel.', flags: MessageFlags.Ephemeral });
      return;
    }

    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const anonymous = interaction.options.getBoolean('anonymous') ?? false;

    const embed = new EmbedBuilder().setColor(0xec008c).setTitle(title).setDescription(description);

    if (!anonymous) {
      const member = interaction.guild?.members.cache.get(user.id);
      embed.setAuthor({
        name: member?.displayName ?? user.username,
        iconURL: user.avatarURL() ?? undefined,
      });
    }

    await interaction.reply({
      content: 'Thank you for your suggestion/feedback, your message will be posted in our #features channel.',
      flags: MessageFlags.Ephemeral,
    });

    const suggestionMsg = await targetChannel.send({ embeds: [embed] });
    await suggestionMsg.react('👍');
    await suggestionMsg.react('👎');
  },
};

export default command;
