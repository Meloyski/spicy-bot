const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("react-roles")
    .setDescription("Embed that allows uers to select roles")
    .addRoleOption((option) =>
      option.setName("role").setDescription("Choose a role").setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole("role");

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("addRole")
        .setLabel(`Add ${role.name} Role`)
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("removeRole")
        .setLabel(`Remove ${role.name} Role`)
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`Toggle ${role.name} Role`)
      .setDescription(
        "In our Spicy Bot test environment, we can use this command to toggle on/off the 'Mod' role for testing."
      );

    interaction.deferReply();
    interaction.deleteReply();

    await interaction.channel.send({ embeds: [embed], components: [button] });

    const collector =
      await interaction.channel.createMessageComponentCollector();

    collector.on("collect", async (i) => {
      const member = i.member;

      if (i.customId === "addRole") {
        member.roles.add(role);
        i.reply({
          content: `You now have the ${role.name} role.`,
          ephemeral: true,
        });
      }

      if (i.customId === "removeRole") {
        member.roles.remove(role);
        i.reply({
          content: `The ${role.name} role has been removed.`,
          ephemeral: true,
        });
      }
    });
  },
};
