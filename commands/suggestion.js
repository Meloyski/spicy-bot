const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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
      guild.channels.cache.get("1087784107364331600") ||
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
