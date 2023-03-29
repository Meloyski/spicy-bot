const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Define the command handler function
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verified")
    .setDescription("Set a server nickname and request verification")
    .addStringOption((option) =>
      option
        .setName("bungie-id")
        .setDescription("Your new nickname, must end with #XXXX")
        .setRequired(true)
    ),
  async execute(interaction) {
    // Get the user-provided nickname option
    const nickname = interaction.options.getString("bungie-id");

    // Validate the nickname format
    const nicknameRegex = /^(.+)#(\d{4})$/;
    if (!nicknameRegex.test(nickname)) {
      return await interaction.reply({
        content: 'Invalid nickname format. Please use "name#1234".',
        ephemeral: true,
      });
    }

    // Set the user's nickname in the server
    await interaction.member.setNickname(nickname);

    // Send a confirmation message to the user
    await interaction.reply({
      content: "Your nickname has been submitted for verification.",
      ephemeral: true,
    });

    const channelId = "1090288377045196820"; // Replace with your channel ID
    const channel = interaction.client.channels.cache.get(channelId);
    if (!channel) return console.error("Channel not found.");

    const nicknameMember = interaction.member.toString();

    const verifiedButton = new ButtonBuilder()
      .setCustomId("verified")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Success);

    const verifiedRow = new ActionRowBuilder().addComponents(verifiedButton);

    await channel.send({
      content: `${nicknameMember} has requested verification. Please make sure their Discord nickname matches their BungieID.`,
      components: [verifiedRow],
    });
  },
};
