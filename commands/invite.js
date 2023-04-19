const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get the Spicy Ramen Discord Invite link"),
  async execute(interaction) {
    await interaction.reply({
      content: "https://discord.gg/e6F4cX4XVP",
    });
  },
};
