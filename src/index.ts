import fs from 'node:fs';
import path from 'node:path';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  GuildMember,
  MessageFlags,
} from 'discord.js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import type { SpicyCommand } from './types';
import './types'; // activate Client module augmentation
import { trackUsage } from './util/trackUsage';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Load commands
client.commands = new Collection<string, SpicyCommand>();
const commandsPath = path.join(__dirname, 'commands');
const fileExt = __filename.endsWith('.ts') ? '.ts' : '.js';
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(fileExt));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandModule = require(filePath);
  const command: SpicyCommand = commandModule.default ?? commandModule;
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  client.user?.setPresence({
    activities: [{ name: 'Send Noods', type: ActivityType.Streaming }],
    status: 'online',
  });

});

// Welcome message state
let lastWelcomeMessage: import('discord.js').Message | null = null;
let lastWelcomeTimestamp = 0;
const WELCOME_TIMEOUT = 6 * 60 * 60 * 1000;

client.on(Events.GuildMemberAdd, async (member) => {
  trackUsage(member.guild.id, member.id, 'member-join');
  try {
    const channel = member.guild.channels.cache.get(process.env.LOBBY_CHANNEL ?? '');
    if (!channel || !channel.isTextBased()) {
      console.error(`Lobby channel not found: ${process.env.LOBBY_CHANNEL}`);
      return;
    }

    const currentTime = Date.now();

    if (lastWelcomeMessage && currentTime - lastWelcomeTimestamp < WELCOME_TIMEOUT) {
      await lastWelcomeMessage.edit({
        content: `<@${member.id}> ${lastWelcomeMessage.content}`,
      });
    } else {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        system: "You are Cayde-6 from Destiny 2, but you are undercover known as 'Spicy Bot.' No one can know you are actually Cayde-6 unless they ask nicely. You have a witty, sarcastic, and humorous personality.",
        messages: [
          {
            role: 'user',
            content: "A new member has joined. Write a witty and humorous welcome message. Don't call them out by name and don't use emojis.",
          },
        ],
        max_tokens: 100,
        stop_sequences: ['.', '\n'],
      });

      const randomWelcomeMessage = response.content[0].type === 'text' ? response.content[0].text : '';
      const userMention = `<@${member.id}>`;
      const staticMessage =
        "I'm the Spicy Bot! Feel free to ask me anything — just tag me like this: `@Spicy Bot`, add your message, and hit send!";

      const modMention = `<@&${process.env.MOD}>`;
      const sherpaMention = `<@&${process.env.SHERPA}>`;
      const poblanoMention = `<@&${process.env.POBLANO}>`;
      const spicyFamilyMention = `<@&${process.env.SPICYFAMILY}>`;

      const embedBungieLink = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle('Link your BungieID to your Account')
        .setDescription(
          `All SRH members must link their Bungie ID to Discord. This validates your membership and will replace your ${poblanoMention} role with ${spicyFamilyMention}, granting full server access.`
        )
        .addFields(
          {
            name: 'Get Your Bungie ID',
            value: `Go to Bungie.net and grab your Bungie ID from your [Bungie Profile](https://www.bungie.net/7/en/User/Profile). Your Bungie ID consists of Username#0000.`,
          },
          {
            name: 'Link Your Bungie ID',
            value:
              'Go to our [#destiny-chat](https://discord.com/channels/558700711647641630/585863497385115670) channel, type `/` to see a link of commands. Choose `/bungie-link` and paste your Bungie ID and submit. Spicy Bot will verify that your Bungie ID is correct and assign it to your Server Profile.',
          }
        );

      const embedResources = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle('SRH Resources')
        .addFields({
          name: 'Links',
          value: `- [SRH Rules](https://discord.com/channels/558700711647641630/1086001552969441350) — Contact a ${modMention} with any questions.\n- [SRH Clan Invite](https://www.bungie.net/en/ClanV2/Chat?groupId=291803) — Reach out to a ${modMention}.\n- Need help? — Tag a ${sherpaMention}.\n\n`,
        });

      const embedCommands = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle('Spicy Bot Commands')
        .setDescription(
          'To use a Spicy Bot command, type `/` in your Message Input, to show available Commands for a specific channel.'
        )
        .addFields({
          name: 'Commands',
          value: `- \`/bungie-link\`, to update your Bungie ID in our database if you ever change your Destiny username.\n- \`/lfg-destiny\`, to post a LFG to [Destiny LFG](https://discord.com/channels/558700711647641630/1087744773332406403).\n- \`/lfg-general\`, to post a LFG to [General LFG](https://discord.com/channels/558700711647641630/1192471273998135336).\n- \`/suggestion\`, to add a server suggestion to the [Suggestion Box](https://discord.com/channels/558700711647641630/1097995676106895470) channel.\n- \`/invite\`, to invite your friends.`,
        })
        .setFooter({ text: 'Love, Spicy 💜' });

      lastWelcomeMessage = await channel.send({
        content: `${userMention} — ${randomWelcomeMessage}. \n\n${staticMessage}`,
        embeds: [embedBungieLink, embedResources, embedCommands],
      });
      lastWelcomeTimestamp = currentTime;
    }

    await member.roles.add(process.env.POBLANO ?? '');
  } catch (error) {
    console.error('Failed to send or edit welcome message:', error);
  }
});

// AI chat
const conversationHistories = new Map<string, { role: 'user' | 'assistant'; content: string }[]>();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const mentionRegex = new RegExp(`^<@!?${client.user?.id}>`);
  const isMentioned = mentionRegex.test(message.content);
  const isReply = message.reference?.messageId != null;

  if (!isMentioned && !isReply) return;

  trackUsage(message.guildId ?? 'dm', message.author.id, 'ai-chat');
  const history = conversationHistories.get(message.channel.id) ?? [];

  try {
    let originalMessageContent = message.content;

    if (isReply && message.reference?.messageId) {
      try {
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (referencedMessage.author.id !== client.user?.id) return;
        originalMessageContent = referencedMessage.content;
        console.log(`Original message: ${originalMessageContent}`);
      } catch (err) {
        console.error('Failed to fetch the original message:', err);
        return;
      }
    }

    history.push({ role: 'user', content: message.content });
    const recentHistory = history.slice(-10);

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      system: "You are Cayde-6 from Destiny 2, but you are under cover known as 'Spicy Bot.' No one can know you are actually Cayde-6, unless they ask nicely. You have a witty, sarcastic, and humorous personality. You always find a way to lighten the mood, even in serious situations. You love cracking jokes and being the charming rogue that everyone loves. Keep your response less than 1600 characters!",
      messages: recentHistory,
      max_tokens: 512,
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    history.push({ role: 'assistant', content });
    conversationHistories.set(message.channel.id, history);

    await message.reply(content);
  } catch (err) {
    console.error(err);
    await message.reply('As an AI robot, I errored out.');
  }
});

// Slash command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  trackUsage(interaction.guildId ?? 'dm', interaction.user.id, interaction.commandName);
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      }
    } catch {
      // Interaction expired or already handled — nothing we can do
    }
  }
});

// Member leave
client.on('guildMemberRemove', async (member) => {
  trackUsage(member.guild.id, member.user.id, 'member-leave');
  const channel = member.guild.channels.cache.get(process.env.MOD_CHANNEL ?? '');
  if (!channel || !channel.isTextBased()) return;
  await channel.send(`**${member.user.username}** has left the server.`).catch(console.error);
});

// LFG button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const commandMap: Record<string, string> = {
    lfgJoin: 'lfg-join',
    lfgBackup: 'lfg-backup',
    lfgRemove: 'lfg-remove',
    lfgDelete: 'lfg-delete',
  };

  if (!commandMap[interaction.customId]) return;

  trackUsage(interaction.guildId ?? 'dm', interaction.user.id, `button:${interaction.customId}`);
  const userId = interaction.user.id;
  const guildMember = interaction.member as GuildMember | null;

  const message = interaction.message;
  const embed = EmbedBuilder.from(message.embeds[0]);
  const fields = embed.data.fields ?? [];

  const currentPlayersField = fields.find((f) => f.name.trim() === 'Current Players');
  const reservePlayersField = fields.find((f) => f.name === 'Backup Players');

  if (!currentPlayersField || !reservePlayersField) {
    await interaction.reply({ content: 'Could not read the LFG post fields.', flags: MessageFlags.Ephemeral });
    return;
  }

  const currentPlayers: string[] = currentPlayersField.value.match(/<@.*?>/g) ?? [];
  const reservePlayers: string[] = reservePlayersField.value.match(/<@.*?>/g) ?? [];

  if (interaction.customId === 'lfgJoin') {
    const maxNumber = message.embeds[0].title ?? '';
    const maxPlayersMatch = maxNumber.match(/(\d{1,2})/);
    const maxPlayers = maxPlayersMatch ? parseInt(maxPlayersMatch[1]) : 0;

    console.log(`currentPlayers: ${currentPlayers}, maxPlayers: ${maxPlayers}`);

    if (currentPlayers.length >= maxPlayers) {
      if (!reservePlayers.includes(`<@${userId}>`)) {
        reservePlayersField.value += `\n<@${userId}>`;
        await message.edit({ embeds: [embed] });
        await interaction.reply({ content: "Sorry, this group is already full! You've been added to the reserve list.", flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: "Sorry, this group is already full and you're already on the reserve list!", flags: MessageFlags.Ephemeral });
      }
    } else {
      if (reservePlayers.includes(`<@${userId}>`)) {
        reservePlayersField.value = reservePlayersField.value.replace(`<@${userId}>`, '');
      }
      if (!currentPlayers.includes(`<@${userId}>`)) {
        currentPlayersField.value += `\n<@${userId}>`;
        await message.edit({ embeds: [embed] });
        await interaction.reply({ content: "You've been successfully added to this LFG group!", flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: "You've already been added to this LFG group!", flags: MessageFlags.Ephemeral });
      }
    }
  } else if (interaction.customId === 'lfgBackup') {
    if (currentPlayers.includes(`<@${userId}>`)) {
      currentPlayersField.value = currentPlayersField.value.replace(`<@${userId}>`, '');
    }
    if (!reservePlayers.includes(`<@${userId}>`)) {
      reservePlayersField.value += `\n<@${userId}>`;
      await message.edit({ embeds: [embed] });
      await interaction.reply({ content: "You've been successfully added to the Backup Players list!", flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: "You're already on the Backup Players list!", flags: MessageFlags.Ephemeral });
    }
  } else if (interaction.customId === 'lfgRemove') {
    if (currentPlayers.includes(`<@${userId}>`)) {
      currentPlayersField.value = currentPlayersField.value.replace(`<@${userId}>`, '');
      await message.edit({ embeds: [embed] });
      await interaction.reply({ content: "You've been successfully removed from the Current Players list!", flags: MessageFlags.Ephemeral });
    } else if (reservePlayers.includes(`<@${userId}>`)) {
      reservePlayersField.value = reservePlayersField.value.replace(`<@${userId}>`, '');
      await message.edit({ embeds: [embed] });
      await interaction.reply({ content: "You've been successfully removed from the Backup Players list!", flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: "Your name isn't on any of the lists!", flags: MessageFlags.Ephemeral });
    }
  } else if (interaction.customId === 'lfgDelete') {
    const embedAuthor = message.embeds[0].author?.name;
    const username = guildMember?.displayName ?? interaction.user.username;
    console.log(`embedAuthor: ${embedAuthor}, interaction = username: ${username}, nickname: ${userId}`);

    if (embedAuthor === username) {
      await message.delete();
    } else {
      await interaction.reply({ content: 'Sorry, only the author of the post can delete it!', flags: MessageFlags.Ephemeral });
    }
  }
});

client.login(process.env.TOKEN);
