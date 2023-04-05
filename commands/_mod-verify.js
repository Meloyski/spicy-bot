const { SlashCommandBuilder } = require("@discordjs/builders");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_mod-verify")
    .setDescription(
      "Give users the ability to interact with our Discord Modal for them to change their BungieID"
    )
    .addBooleanOption((option) =>
      option
        .setName("edit")
        .setDescription(
          "Whether to edit the existing message or send a new one."
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title") // Add your BungieID
        .setDescription("Give the Verify Embed a Title")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description") // "Go to your Destiny friend's list or Bungie.net. There you can find your Bungie ID which should be a username followed by four numbers (ie: username#1234). \n\nRun the `/verify` slash command to add your Bungie ID and verify your account. Doing so will update your Spicy Ramen server nickname to match your ID and you will gain the 'verified' role. This makes it easier for your friends and clanmates to find you if you are looking for help or LFG. \n\n*Changing your server nickname only changes your name in this server, your original Discord username will remain the same.*"
        .setDescription("Update the Description of the Verify Embed")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),

  async execute(interaction) {
    const editMessage = interaction.options.getBoolean("edit");

    const title = interaction.options.getString("title");
    const description = interaction.options
      .getString("description")
      .replace(/\\n/g, "\n");

    // const button = new ActionRowBuilder().addComponents(
    //   new ButtonBuilder()
    //     .setCustomId("bungie")
    //     .setLabel(`Add BungieID`)
    //     .setStyle(ButtonStyle.Secondary)
    // );
    // Commented out button since Modals aren't supported with the use of buttons v14.7.1

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(title)
      .setDescription(description)
      .addFields(
        { name: "\u200B", value: "\u200B" },
        {
          name: "Step 1",
          value: "Run the `/verify` command in any channel.",
          inline: true,
        },
        {
          name: "Step 2",
          value: "Add your BungieID in the `bungie-id` field.",
          inline: true,
        },
        { name: "Step 3", value: "Submit your verification.", inline: true }
      );

    interaction.deferReply();

    if (editMessage) {
      const messages = await interaction.channel.messages.fetch({
        limit: 1,
        before: interaction.id,
      });
      const previousMessage = messages.first();

      await previousMessage.edit({
        embeds: [embed],
      });
    } else {
      await interaction.channel.send({
        embeds: [embed],
      });
    }
    interaction.deleteReply();
  },
};
