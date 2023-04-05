const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mod-message")
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

    await interaction.channel.send(message);

    interaction.deferReply();
    interaction.deleteReply();
  },
};
