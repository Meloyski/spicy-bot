const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get the Spicy Ramen Discord Invite link"),
  async execute(interaction) {
    // Acknowledge the interaction
    await interaction.deferReply(); // Acknowledge the interaction

    // Get the guild (server) from the interaction
    const guild = interaction.guild;

    // Check the boost level
    const boostLevel = guild.premiumTier;

    // Log the boost level for debugging
    console.log(`Current boost level: ${boostLevel}`);

    let inviteLink;

    // Check boost levels and set invite link accordingly
    if (boostLevel === 0 || boostLevel === 1 || boostLevel === 2) {
      inviteLink = "https://discord.gg/7n5w23q"; // For boost levels 0, 1, or 2
    } else {
      inviteLink = "https://discord.gg/spicyramenhouse"; // For boost level 3
    }

    // Send the initial reply (can be a simple message)
    await interaction.editReply({
      content: "Here's the invite link:", // Optional message
    });

    // Send the invite link as a follow-up message to ensure the preview shows
    await interaction.followUp({
      content: inviteLink, // Send the link as a follow-up to get the preview
    });
  },
};
