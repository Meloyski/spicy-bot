const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toggle-mod")
    .setDescription("Toggle 'Mod' Role"),
  async execute(interaction) {
    const toggleEmbed = new EmbedBuilder()
      .setTitle("Toggle 'Mod' Role")
      .setDescription(
        "In our test environment, use this to Toggle your 'Mod' role on/off for testing."
      );

    const toggleEmbedMsg = await interaction.channel.send({
      embeds: [toggleEmbed],
    });
    await toggleEmbedMsg.react("✅");
  },
};
