const { SlashCommandBuilder } = require("discord.js");

const db = require("../database"); // Import the promise-based db pool

// Function to handle retry logic for database queries
async function queryWithRetry(sql, params, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [rows] = await db.query(sql, params); // Using db.query, which is promise-based
      return rows; // Return the query result rows
    } catch (error) {
      if (attempt < retries) {
        console.warn(
          `[DB RETRY] Query failed on attempt ${attempt}, retrying...`
        );
      } else {
        console.error(`[DB ERROR] Query failed after ${retries} attempts.`);
        throw error;
      }
    }
  }
}

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

    // Log command usage in the database
    const commandType = "invite";
    const userId = interaction.user.id;

    try {
      await queryWithRetry(
        `
        INSERT INTO spicy_usage (command_type, command_timestamp, command_by)
        VALUES (?, NOW(), ?);
        `,
        [commandType, userId]
      );
      console.log(`[DB LOG] Command usage logged in spicy_usage table.`);
    } catch (error) {
      console.error(`[DB ERROR] Failed to log command usage:`, error);
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
