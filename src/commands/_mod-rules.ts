import { SlashCommandBuilder, EmbedBuilder, TextChannel } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('_mod-rules')
    .setDescription('Update the Spicy Ramen Welcome message and Rules.')
    .addBooleanOption((option) =>
      option
        .setName('edit')
        .setDescription('Whether to edit the existing message or send a new one.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('Add a message before the embed').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('bully').setDescription('Bully Rule').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('nudity').setDescription('Nudity Rule').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('subject').setDescription('Subject Rule').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('info').setDescription('Info Rule').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('political').setDescription('Political Rule').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('spoiler').setDescription('Spoiler Rule').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('chill').setDescription('Chill Rule').setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const editMessage = interaction.options.getBoolean('edit', true);
    const message = interaction.options.getString('message', true).replace(/\\n/g, '\n');

    const embeds = [
      new EmbedBuilder().setColor(0xec008c).setTitle('1. Don\'t be a bully').setDescription(interaction.options.getString('bully', true)),
      new EmbedBuilder().setColor(0xec008c).setTitle('2. No nudity or graphic/sexual content').setDescription(interaction.options.getString('nudity', true)),
      new EmbedBuilder().setColor(0xec008c).setTitle('3. Inappropriate subjects').setDescription(interaction.options.getString('subject', true)),
      new EmbedBuilder().setColor(0xec008c).setTitle('4. No sharing of personal information').setDescription(interaction.options.getString('info', true)),
      new EmbedBuilder().setColor(0xec008c).setTitle('5. No political/religious talk').setDescription(interaction.options.getString('political', true)),
      new EmbedBuilder().setColor(0xec008c).setTitle('6. Use spoiler tags').setDescription(interaction.options.getString('spoiler', true)),
      new EmbedBuilder().setColor(0xec008c).setTitle('7. Help keep things chill').setDescription(interaction.options.getString('chill', true)),
    ];

    interaction.deferReply();

    const ch = interaction.channel as TextChannel | null;
    if (editMessage) {
      const messages = await ch?.messages.fetch({ limit: 1, before: interaction.id });
      const previousMessage = messages?.first();
      await previousMessage?.edit({ content: message, embeds });
    } else {
      await ch?.send({ content: message, embeds });
    }

    interaction.deleteReply();
  },
};

export default command;
