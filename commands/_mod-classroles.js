const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("@discordjs/builders");

const {
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_mod-classroles")
    .setDescription(
      "Allow users to choose what Class they want their 'main' to be."
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
        .setName("message")
        .setDescription("Add a message before the embed")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Add a title to the embed.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Add a description to the embed.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const editMessage = interaction.options.getBoolean("edit");

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("addHunter")
        .setLabel(`Hunter`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("779018489721520138"),

      new ButtonBuilder()
        .setCustomId("addTitan")
        .setLabel(`Titan`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("779018489368281100"),

      new ButtonBuilder()
        .setCustomId("addWarlock")
        .setLabel(`Warlock`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("779018489448890449")
    );

    const message = interaction.options
      .getString("message")
      .replace(/\\n/g, "\n");

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(title) // Choose Your Destiny Main
      .setDescription(description) // Select which Guardian class is your main, you can only select one. This will also display your Discord username under that specific class.
      .addFields({
        name: "Guardian Classes",
        value:
          "<:destinyhunter:779018489721520138> - <@&1090009686222315522>\n <:destinytitan:779018489368281100> - <@&1090009716450676898>\n <:destinywarlock:779018489448890449> - <@&1090009741062848514>\n ", // Test server role IDs
        inline: true,
      });

    interaction.deferReply();
    if (editMessage) {
      const messages = await interaction.channel.messages.fetch({
        limit: 1,
        before: interaction.id,
      });
      const previousMessage = messages.first();

      await previousMessage.edit({
        content: message,
        embeds: [embed],
        components: [button],
      });
    } else {
      await interaction.channel.send({
        content: message,
        embeds: [embed],
        components: [button],
      });
    }
    interaction.deleteReply();
  },
};
