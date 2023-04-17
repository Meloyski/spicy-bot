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
          { name: "1", value: "1" },
          { name: "2", value: "2" },
          { name: "3", value: "3" },
          { name: "4", value: "4" },
          { name: "5", value: "5" }
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
            name: "Dungeon: Spire of the Watcher",
            value: "Dungeon: Spire of the Watcher",
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
        .setCustomId("lfg-join")
        .setLabel(`Join`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("lfg-reserve")
        .setLabel(`Join as a Reserve`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("lfg-remove")
        .setLabel(`Remove`)
        .setStyle(ButtonStyle.Secondary)
    );

    const players = interaction.options.getString("players");
    const activity = interaction.options.getString("activity");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const time = interaction.options.getString("start-time");
    const channel = interaction.options.getChannel("channel");

    const displayName = interaction.member.displayName;
    const userAvatar = interaction.user.avatarURL();

    const currentPlayers = 0;
    const currentPlayerList = {
      name: `Current Players (${currentPlayers}/${players})`,
      value: " ",
      inline: true,
    };
    const currentReserveList = {
      name: "Reserve Players",
      value: " ",
      inline: true,
    };

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`LF${players}: ${activity}`)
      .setAuthor({ name: displayName, iconURL: userAvatar })
      .addFields(
        currentPlayerList,
        {
          name: "\u200B",
          value: "\u200B",
          inline: true,
        },
        currentReserveList
      )
      .addFields(
        { name: "Start Date/Time", value: time, inline: true },
        { name: "Voice", value: channel.name, inline: true }
      );

    if (description) {
      embed.setDescription(description);
    }

    if (title) {
      embed.setTitle(`LF${players}: ${activity} ${title && `- ${title}`}`);
    }

    await interaction.channel.send({ embeds: [embed], components: [button] });

    interaction.deferReply();
    interaction.deleteReply();
  },
};
