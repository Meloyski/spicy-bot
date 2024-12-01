const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const dotenv = require("dotenv");
const connection = require("../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bungie-link")
    .setDescription("Fetch a membership ID using BungieName and Code.")
    .addStringOption((option) =>
      option
        .setName("bungiename")
        .setDescription("The Bungie username (e.g., Meloyski)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("bungiecode")
        .setDescription("The Bungie numeric code (e.g., 5718)")
        .setRequired(true)
    ),
  async execute(interaction) {
    const bungieName = interaction.options.getString("bungiename");
    const bungieCode = interaction.options.getString("bungiecode");
    const apiKey = process.env.BUNGIE_API_KEY;
    const userId = interaction.user.id; // The Discord user ID

    try {
      await interaction.deferReply(); // Wait for API call to complete

      const response = await axios.post(
        `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/`,
        {
          displayName: bungieName,
          displayNameCode: parseInt(bungieCode),
        },
        {
          headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Response.length > 0) {
        const player = response.data.Response[0];
        const membershipId = player.membershipId;
        const membershipType = player.membershipType;

        // Construct the bungie_id as bungieName#bungieCode (e.g., Meloyski#5718)
        const bungieId = `${bungieName}#${bungieCode}`;

        // Update only the bungie_id for the user with the matching user_id (discord ID)
        const query = `UPDATE user_roles 
                       SET bungie_id = ? 
                       WHERE user_id = ?`;

        const values = [bungieId, userId];

        connection.query(query, values, (err, result) => {
          if (err) {
            console.error("Error updating bungie_id in DB:", err);
            interaction.editReply(
              "An error occurred while updating the Bungie ID in the database. Please try again later."
            );
            return;
          }

          // Log what the Bungie ID was that was added
          console.log(`Updated Bungie ID for user ${userId}: ${bungieId}`);

          console.log("Bungie ID updated in DB:", result);
        });

        // Respond to the interaction with the player data
        await interaction.editReply({
          content: `Player found! 🎮\n**Membership ID:** ${membershipId}\n**Membership Type:** ${membershipType}\n**Bungie ID:** ${bungieId}`,
        });
      } else {
        await interaction.editReply(
          "No player found with the provided BungieName and Code. 😞"
        );
      }
    } catch (error) {
      console.error("Error fetching player information:", error);
      await interaction.editReply(
        "An error occurred while fetching the membership ID. Please try again later."
      );
    }
  },
};
