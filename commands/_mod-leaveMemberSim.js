const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("simulateleave")
    .setDescription(
      "Simulates a member leaving the server for testing purposes."
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to simulate leaving.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "Member not found in the server.",
        ephemeral: true,
      });
    }

    // Emit the guildMemberRemove event
    interaction.client.emit("guildMemberRemove", member);

    await interaction.reply({
      content: `Simulated ${user.tag} leaving the server.`,
      ephemeral: true,
    });
  },
};
