const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_embed")
    .setDescription("Add an Embed as Spicy")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Add a Title to the Embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Add a Description to the Embed")
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Add a Message before your Embed")
    ),
  async execute(interaction) {
    const embedTitle = interaction.options.getString("title");
    const embedDescription = interaction.options.getString("description");
    const embedMessage = interaction.options.getString("message");

    const spicyEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(embedTitle)
      .setDescription(embedDescription);

    interaction.deferReply();
    await interaction.channel.send({
      content: embedMessage,
      embeds: [spicyEmbed],
    });
    interaction.deleteReply();
  },
};
