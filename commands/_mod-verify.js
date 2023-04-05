const { SlashCommandBuilder } = require("@discordjs/builders");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_mod-verify")
    .setDescription(
      "Give users the ability to interact with our Discord Modal for them to change their BungieID"
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    // const button = new ActionRowBuilder().addComponents(
    //   new ButtonBuilder()
    //     .setCustomId("bungie")
    //     .setLabel(`Add BungieID`)
    //     .setStyle(ButtonStyle.Secondary)
    // );
    // Commented out button since Modals aren't supported with the use of buttons v14.7.1

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("Add your BungieID")
      .setDescription(
        "Go to your Destiny friend's list or Bungie.net. There you can find your Bungie ID which should be a username followed by four numbers (ie: username#1234). \n\nInteract with the button down below to add your Bungie ID, doing so will update your Spicy Ramen server nickname to match your ID. This makes it easier for your friends and clanmates to find you if you are looking for help or LFG. \n\nChanging your server nickname only changes your name in this server, your original Discord username will remain the same."
      );

    interaction.deferReply();
    interaction.deleteReply();

    await interaction.channel.send({
      embeds: [embed],
      components: [button],
    });
  },
};
