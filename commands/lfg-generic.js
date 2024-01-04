const { SlashCommandBuilder } = require("@discordjs/builders");

const {
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lfg-general")
    .setDescription(
      "Looking For Gamers, use this command to find new players for a certain activity."
    )
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("What game are you playing?")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("players")
        .setDescription("How many players do you need?")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(99)
    )
    .addStringOption((option) =>
      option
        .setName("start-time")
        .setDescription(
          "What day/time does your activity start? Example: Month Day, 00:00pm EST"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("activity")
        .setDescription("What activity are you looking to do?")
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Give your LFG activity a more details.")
    )
    .addChannelOption((channel) => {
      return channel
        .setName("channel")
        .setDescription("What channel would you like to use")
        .addChannelTypes(ChannelType.GuildVoice);
    }),
  async execute(interaction) {
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("lfgJoin")
        .setLabel(`Join`)
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("lfgBackup")
        .setLabel(`Backup`)
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("lfgRemove")
        .setLabel(`Remove`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("lfgDelete")
        .setLabel(`End`)
        .setStyle(ButtonStyle.Danger)
    );

    const lfgGame = interaction.options.getString("game");
    const lfgMaxPlayers = interaction.options.getNumber("players");
    const lfgActivity = interaction.options.getString("activity");
    const description = interaction.options.getString("description");
    const time = interaction.options.getString("start-time");
    const channel = interaction.options.getChannel("channel");

    const displayName = interaction.member.displayName;
    const userAvatar = interaction.user.avatarURL();

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`LF${lfgMaxPlayers} - ${lfgGame}`)
      .setAuthor({ name: displayName, iconURL: userAvatar })
      .addFields(
        {
          name: `Current Players         `, //(${currentPlayers}/${lfgMaxPlayers})
          value: " ",
          inline: true,
        },
        {
          name: "Backup Players",
          value: " ",
          inline: true,
        },
        {
          name: "\u200B",
          value: "\u200B",
        },
        { name: "Start Date/Time", value: time }
      );

    if (lfgActivity) {
      embed.setTitle(`LF${lfgMaxPlayers} - ${lfgGame}: ${lfgActivity}`);
    }

    if (description) {
      embed.setDescription(description);
    }

    if (channel) {
      embed.addFields({ name: "Voice", value: channel.name });
    }

    interaction.deferReply();
    await interaction.channel.send({ embeds: [embed], components: [button] });
    interaction.deleteReply();
  },
};
