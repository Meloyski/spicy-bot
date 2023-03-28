const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("_mod-rules")
    .setDescription("Update the Spicy Ramen Welcome message and Rules.")
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
      option.setName("bully").setDescription("Bully Rule").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("nudity").setDescription("Nudity Rule").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("subject").setDescription("Subject Rule").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("info").setDescription("Info Rule").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("political")
        .setDescription("Political Rule")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("spoiler").setDescription("Spoiler Rule").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("chill").setDescription("Chill Rule").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("Nickname Rule")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const editMessage = interaction.options.getBoolean("edit");

    const message = interaction.options
      .getString("message")
      .replace(/\\n/g, "\n");

    const bully = interaction.options.getString("bully");
    const nudity = interaction.options.getString("nudity");
    const subject = interaction.options.getString("subject");
    const info = interaction.options.getString("info");
    const political = interaction.options.getString("political");
    const spoiler = interaction.options.getString("spoiler");
    const chill = interaction.options.getString("chill");
    const nickname = interaction.options.getString("nickname");

    const bullyEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("1. Don't be a bully")
      .setDescription(bully);

    const nudityEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("2. No nudity or graphic/sexual content")
      .setDescription(nudity);

    const subjectEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("3. Inappropriate subjects")
      .setDescription(subject);

    const infoEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("4. No sharing of personal information")
      .setDescription(info);

    const politicalEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("5. No political/religious talk")
      .setDescription(political);

    const spoilerEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("6. Use spoiler tags")
      .setDescription(spoiler);

    const chillEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("7. Help keep things chill")
      .setDescription(chill);

    const nicknameEmbed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle("8. Server nickname")
      .setDescription(nickname);

    interaction.deferReply();
    if (editMessage) {
      const messages = await interaction.channel.messages.fetch({
        limit: 1,
        before: interaction.id,
      });
      const previousMessage = messages.first();

      await previousMessage.edit({
        content: message,
        embeds: [
          bullyEmbed,
          nudityEmbed,
          subjectEmbed,
          infoEmbed,
          politicalEmbed,
          spoilerEmbed,
          chillEmbed,
          nicknameEmbed,
        ],
      });
    } else {
      await interaction.channel.send({
        content: message,
        embeds: [
          bullyEmbed,
          nudityEmbed,
          subjectEmbed,
          infoEmbed,
          politicalEmbed,
          spoilerEmbed,
          chillEmbed,
          nicknameEmbed,
        ],
      });
    }
    interaction.deleteReply();
  },
};
