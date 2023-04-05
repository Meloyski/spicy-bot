const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_mod-message")
    .setDescription("Send a message as Spicy Bot")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "Send a custom Message, please behave since this is Spicy Bot"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message-id")
        .setDescription("Is this message a Reply to another member's message?")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(0),

  async execute(interaction) {
    const message = interaction.options.getString("message");
    const messageId = interaction.options.getString("message-id");

    if (messageId) {
      try {
        const channel = interaction.channel;
        const messageToRespond = await channel.messages.fetch(messageId);
        messageToRespond.reply(message);
      } catch (error) {
        console.error(error);
        interaction.reply(
          `Failed to send the message. Reason: ${error.message}`
        );
      }
    } else {
      await interaction.channel.send(message);
    }

    await interaction.deferReply({ ephemeral: true });
    await interaction.deleteReply();
  },
};
