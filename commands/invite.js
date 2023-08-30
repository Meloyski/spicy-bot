const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get the Spicy Ramen Discord Invite link"),
  async execute(interaction) {
    await interaction.reply({
      content: "https://discord.gg/7n5w23q",
    });
  },
};
