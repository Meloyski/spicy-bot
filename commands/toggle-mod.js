const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toggle-mod")
    .setDescription("Toggle 'Mod' Role"),
  async execute(interaction) {
    const toggleEmbed = new EmbedBuilder()
      .setTitle("Toggle 'Mod' Role")
      .setDescription(
        "In our test environment, use this to Toggle your 'Mod' role on/off for testing."
      );

    const toggleEmbedMsg = await interaction.channel.send({
      embeds: [toggleEmbed],
    });
    await toggleEmbedMsg.react("✅");

    // Listen for the 'messageReactionAdd' event
    const filter = (reaction, user) =>
      reaction.emoji.name === "✅" && user.id !== toggleEmbedMsg.author.id;
    const collector = toggleEmbedMsg.createReactionCollector({
      filter,
    });

    collector.on("collect", async (reaction, user) => {
      const guild = interaction.guild;
      const member = guild.members.cache.get(user.id);
      const role = guild.roles.cache.find((role) => role.name === "Mod");

      // Check if the user already has the role
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        toggleEmbed.setDescription(`${member} no longer has the 'Mod' role.`);
        testMessage = "You no longer have the Mod role.";
      } else {
        await member.roles.add(role);
        toggleEmbed.setDescription(`${member} has been given the 'Mod' role.`);
        testMessage = "You have been given the Mod role.";
      }

      await interaction.channel.send({ content: testMessage, ephemeral: true });
      // Update the embed message
      // await toggleEmbedMsg.channel.send({ embeds: [toggleEmbed] });
    });
  },
};
