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
    console.log("Command executed: /simulateleave");

    const user = interaction.options.getUser("user") || interaction.user;
    console.log(`User resolved: ${user.username} (${user.id})`);

    const member = interaction.guild.members.cache.get(user.id);
    console.log(
      member
        ? `Member found in guild: ${member.user.username} (${member.id})`
        : "Member not found in guild."
    );

    if (!member) {
      console.log("Replying with: Member not found in the server.");
      return interaction.reply({
        content: "Member not found in the server.",
        ephemeral: true,
      });
    }

    console.log("Emitting 'guildMemberRemove' event...");
    interaction.client.emit("guildMemberRemove", member);

    console.log(`Replying with: Simulated ${user.usename} leaving the server.`);
    await interaction.reply({
      content: `Simulated ${user.username} leaving the server.`,
      ephemeral: true,
    });
  },
};
