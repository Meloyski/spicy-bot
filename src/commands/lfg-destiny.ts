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
    .setName('lfg-destiny')
    .setDescription(
      'Looking for fellow Guardians? Use this command to find players for certain Destiny activities.'
    )
    .addStringOption((option) =>
      option
        .setName('players')
        .setDescription('How many players do you need?')
        .setRequired(true)
        .addChoices(
          { name: '1 Player', value: '1' },
          { name: '2 Players', value: '2' },
          { name: '3 Players', value: '3' },
          { name: '4 Players', value: '4' },
          { name: '5 Players', value: '5' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('activity')
        .setDescription('What activity are you looking to do?')
        .setRequired(true)
        .addChoices(
          { name: 'Raid', value: 'Raid' },
          { name: 'Dungeon', value: 'Dungeon' },
          { name: 'Onslaught', value: 'Onslaught' },
          { name: 'Exotic Mission', value: 'Exotic Mission' },
          { name: 'Nightfall', value: 'Nightfall' },
          { name: 'Nightfall: Grand Master', value: 'Nightfall: Grand Master' },
          { name: 'Strike', value: 'Strike' },
          { name: 'Crucible', value: 'Crucible' },
          { name: 'Iron Banner', value: 'Iron Banner' },
          { name: 'Trials', value: 'Trials' },
          { name: 'Gambit', value: 'Gambit' },
          { name: 'MISC', value: 'MISC' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('start-time')
        .setDescription('What day/time does your activity start? Example: Month Day, 00:00pm EST')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('Additional title information')
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('Give your LFG activity more details.')
    )
    .addChannelOption((channel) =>
      channel
        .setName('channel')
        .setDescription('What channel would you like to use?')
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  async execute(interaction) {
    console.log(`[COMMAND TRIGGERED] lfg-destiny executed by ${interaction.user.tag}.`);

    const lfgMaxPlayers = interaction.options.getString('players', true);
    const lfgActivity = interaction.options.getString('activity', true);
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const time = interaction.options.getString('start-time', true);
    const channel = interaction.options.getChannel('channel');

    const member = interaction.member as GuildMember;
    const displayName = member.displayName;
    const userAvatar = interaction.user.avatarURL() ?? undefined;

    const embed = new EmbedBuilder()
      .setColor(0xec008c)
      .setTitle(`LF${lfgMaxPlayers} - ${lfgActivity}`)
      .setAuthor({ name: displayName, iconURL: userAvatar })
      .addFields(
        { name: 'Current Players         ', value: ' ', inline: true },
        { name: 'Backup Players', value: ' ', inline: true },
        { name: '​', value: '​' },
        { name: 'Start Date/Time', value: time }
      );

    if (description) embed.setDescription(description);
    if (title) embed.setTitle(`LF${lfgMaxPlayers} - ${lfgActivity}: ${title}`);
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
