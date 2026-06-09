import {
  SlashCommandBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ChannelType,
  GuildMember,
  TextChannel,
} from 'discord.js';
import type { SpicyCommand } from '../types';


const command: SpicyCommand = {
  data: new SlashCommandBuilder()
    .setName('lfg-general')
    .setDescription('Looking For Gamers, use this command to find new players for a certain activity.')
    .addStringOption((option) =>
      option.setName('game').setDescription('What game are you playing?').setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName('players')
        .setDescription('How many players do you need?')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(99)
    )
    .addStringOption((option) =>
      option
        .setName('start-time')
        .setDescription('What day/time does your activity start? Example: Month Day, 00:00pm EST')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('activity').setDescription('What activity are you looking to do?')
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('Give your LFG activity more details.')
    )
    .addChannelOption((channel) =>
      channel
        .setName('channel')
        .setDescription('What channel would you like to use')
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  async execute(interaction) {
    const lfgGame = interaction.options.getString('game', true);
    const lfgMaxPlayers = interaction.options.getNumber('players', true);
    const lfgActivity = interaction.options.getString('activity');
    const description = interaction.options.getString('description');
    const time = interaction.options.getString('start-time', true);
    const channel = interaction.options.getChannel('channel');

    const member = interaction.member as GuildMember;
    const displayName = member.displayName;
    const userAvatar = interaction.user.avatarURL() ?? undefined;

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`LF${lfgMaxPlayers} - ${lfgGame}`)
      .setAuthor({ name: displayName, iconURL: userAvatar })
      .addFields(
        { name: 'Current Players         ', value: ' ', inline: true },
        { name: 'Backup Players', value: ' ', inline: true },
        { name: '​', value: '​' },
        { name: 'Start Date/Time', value: time }
      );

    if (lfgActivity) embed.setTitle(`LF${lfgMaxPlayers} - ${lfgGame}: ${lfgActivity}`);
    if (description) embed.setDescription(description);
    if (channel) embed.addFields({ name: 'Voice', value: channel.name ?? 'Unknown' });

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('lfgJoin').setLabel('Join').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('lfgBackup').setLabel('Backup').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('lfgRemove').setLabel('Remove').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('lfgDelete').setLabel('End').setStyle(ButtonStyle.Danger)
    );

    try {
      await interaction.deferReply();
      await (interaction.channel as TextChannel)?.send({ embeds: [embed], components: [button] });
      await interaction.deleteReply();
    } catch (error) {
      console.error('[ERROR] Failed to send embed:', error);
      await interaction.editReply({ content: 'An error occurred while creating the LFG post.' });
    }
  },
};

export default command;
