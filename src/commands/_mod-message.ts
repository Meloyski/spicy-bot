import { SlashCommandBuilder, TextChannel, MessageFlags } from 'discord.js';
import type { SpicyCommand } from '../types';

const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('_mod-message')
    .setDescription('Send a message as Spicy Bot')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Send a custom Message, please behave since this is Spicy Bot')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('message-id')
        .setDescription("Is this message a Reply to another member's message?")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('edit-id')
        .setDescription('Copy and paste the message-id of the message you want to edit.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(0),

  async execute(interaction) {
    const message = interaction.options.getString('message', true).replace(/\\n/g, '\n');
    const messageId = interaction.options.getString('message-id');
    const editMessageId = interaction.options.getString('edit-id');

    if (!interaction.channel) return;

    if (editMessageId) {
      try {
        const messageToEdit = await interaction.channel.messages.fetch(editMessageId);
        await messageToEdit.edit(message);
      } catch (error) {
        console.error(error);
        await interaction.reply(`Failed to edit the message. Reason: ${(error as Error).message}`);
        return;
      }
    } else if (messageId) {
      try {
        const messageToRespond = await interaction.channel.messages.fetch(messageId);
        await messageToRespond.reply(message);
      } catch (error) {
        console.error(error);
        await interaction.reply(`Failed to send the message. Reason: ${(error as Error).message}`);
        return;
      }
    } else {
      await (interaction.channel as TextChannel).send(message);
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await interaction.deleteReply();
  },
};

export default command;
