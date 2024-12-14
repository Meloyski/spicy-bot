const { SlashCommandBuilder } = require("@discordjs/builders");
const { Events } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_mod-simulate-join")
    .setDescription(
      "Simulates a new member joining the server for testing purposes."
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const member = interaction.member; // Use the command invoker as the simulated member

    // Trigger the guildMemberAdd event
    interaction.client.emit(Events.GuildMemberAdd, member);

    await interaction.reply({
      content: "Simulated a new member joining!",
      ephemeral: true,
    });
  },
};
