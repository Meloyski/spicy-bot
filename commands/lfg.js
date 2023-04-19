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
    .setName("lfg")
    .setDescription(
      "Looking For Gamers, use this command to find new players for a certain activity."
    )
    .addStringOption((option) =>
      option
        .setName("players")
        .setDescription("How many players do you need?")
        .addChoices(
          { name: "1 Player", value: "1" },
          { name: "2 Players", value: "2" },
          { name: "3 Players", value: "3" },
          { name: "4 Players", value: "4" },
          { name: "5 Players", value: "5" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("activity")
        .setDescription("What activity are you looking to do?")
        .setRequired(true)
        .addChoices(
          {
            name: "Raid: Root of Nightmares",
            value: "Raid: Root of Nightmares",
          },
          {
            name: "Raid: Kings Fall",
            value: "Raid: Kings Fall",
          },
          {
            name: "Raid: Vow of the Disciple",
            value: "Raid: Vow of the Disciple",
          },
          {
            name: "Raid: Vault of Glass",
            value: "Raid: Vault of Glass",
          },
          {
            name: "Raid: Deep Stone Crypt",
            value: "Raid: Deep Stone Crypt",
          },
          {
            name: "Raid: Garden of Salvation",
            value: "Raid: Garden of Salvation",
          },
          {
            name: "Raid: Last Wish",
            value: "Raid: Last Wish",
          },
          {
            name: "Dungeon: Spire of the Watcher",
            value: "Dungeon: Spire of the Watcher",
          },
          {
            name: "Dungeon: Duality",
            value: "Dungeon: Duality",
          },
          {
            name: "Dungeon: Grasp of Avarice",
            value: "Dungeon: Grasp of Avarice",
          },
          {
            name: "Dungeon: Prophecy",
            value: "Dungeon: Prophecy",
          },
          {
            name: "Dungeon: Pit of Heresy",
            value: "Dungeon: Pit of Heresy",
          },
          {
            name: "Dungeon: The Shattered Throne",
            value: "Dungeon: The Shattered Throne",
          },
          { name: "Crucible", value: "Crucible" },
          { name: "Gambit", value: "Gambit" },
          { name: "MISC", value: "MISC" }
        )
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
      option.setName("title").setDescription("Additional title information")
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

    const lfgMaxPlayers = interaction.options.getString("players");
    const lfgActivity = interaction.options.getString("activity");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const time = interaction.options.getString("start-time");
    const channel = interaction.options.getChannel("channel");

    const displayName = interaction.member.displayName;
    const userAvatar = interaction.user.avatarURL();

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`LF${lfgMaxPlayers}: ${lfgActivity}`)
      .setAuthor({ name: displayName, iconURL: userAvatar })
      .addFields(
        {
          name: `Current Players`, //(${currentPlayers}/${lfgMaxPlayers})
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
          inline: true,
        },
        { name: "Start Date/Time", value: time, inline: true }
      );

    if (description) {
      embed.setDescription(description);
    }

    if (title) {
      embed.setTitle(
        `LF${lfgMaxPlayers}: ${lfgActivity} ${title && `- ${title}`}`
      );
    }

    if (channel) {
      embed.addFields({ name: "Voice", value: channel.name });
    }

    interaction.deferReply();
    await interaction.channel.send({ embeds: [embed], components: [button] });
    interaction.deleteReply();
  },
};
