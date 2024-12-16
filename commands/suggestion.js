const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

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
    .setName("suggestion")
    .setDescription(
      "Have an idea that the server could benefit from? Want to provie some feedback? Do it here."
    )
    .addBooleanOption((option) =>
      option
        .setName("anonymous")
        .setDescription(
          "Would you like your suggestion/feature to be anonymous?"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Give your idea a title.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Go more into detail about your idea! ")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { guild, user } = interaction;
    const targetChannel =
      guild.channels.cache.get(process.env.SUGGESTION_ID) || // Suggestion Box Channel ID
      guild.channels.cache.find((channel) => channel.name === "suggestion-box");

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const anonymous = interaction.options.getBoolean("anonymous") || false;

    const displayName = interaction.member.displayName;
    const userAvatar = interaction.user.avatarURL();

    if (!targetChannel) {
      await interaction.reply({
        content: "Could not find the target channel.",
        ephemeral: true,
      });
      return;
    }

    // Log command usage in the database
    const commandType = "suggestion";
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

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`${title}`)
      .setDescription(`${description}`);

    if (!anonymous) {
      embed.setAuthor({ name: displayName, iconURL: userAvatar });
    }

    await interaction.reply({
      content: `Thank you for your suggestion/feedback, your message will be posted in our #features channel.`,
      ephemeral: true,
    });

    const suggestionMsg = await targetChannel.send({ embeds: [embed] });

    await suggestionMsg.react("👍");
    await suggestionMsg.react("👎");
  },
};
