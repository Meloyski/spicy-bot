const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bungie-id")
    .setDescription("Update your nickname with your Bungie ID"),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("bungie")
      .setTitle("Add your Bungie ID");

    const nicknameRegex = /^(.+)#(\d{4})$/;

    const bungieId = new TextInputBuilder()
      .setCustomId("bungie-id-name")
      .setRequired(true)
      .setLabel("Bungie ID")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Example: username#1234");

    const firstActionRow = new ActionRowBuilder().addComponents(bungieId);

    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);

    // await interaction.reply({
    //   content:
    //     "You should be prompted with modal to update your Bungie ID. If not please run the /bungie-id command again.",
    //   ephemeral: true,
    // });
  },
};
