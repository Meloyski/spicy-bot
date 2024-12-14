const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const db = require("./database");
const promisePool = require("./database");

const connection = require("./database");
const axios = require("axios");
const BUNGIE_API_KEY = process.env.BUNGIE_API_KEY;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

setInterval(async () => {
  try {
    await db.query("SELECT 1"); // Ping the database to keep the connection alive
    console.log(`[DB KEEP-ALIVE] Connection is active.`);
  } catch (error) {
    console.error(`[DB KEEP-ALIVE ERROR]`, error);
  }
}, 300000);

const insertUser = (
  user_id,
  username,
  nickname,
  roles,
  joined_at,
  profile_url,
  bungie_id,
  bungie_member_id
) => {
  const query = `
    INSERT INTO user_roles (user_id, username, nickname, roles, joined_at, profile_url, bungie_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      nickname = VALUES(nickname),
      roles = VALUES(roles),
      joined_at = VALUES(joined_at),
      profile_url = VALUES(profile_url),
      bungie_id = bungie_id,
      bungie_member_id = bungie_member_id
  `;

  connection.query(
    query,
    [
      user_id,
      username,
      nickname,
      roles,
      joined_at,
      profile_url,
      bungie_id,
      bungie_member_id,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting/updating user in the database:", err);
        return;
      }
    }
  );
};

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_TOKEN,
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  client.user.setPresence({
    activities: [{ name: `Send Noods`, type: ActivityType.STREAMING }],
    status: "online",
  });

  // Update User DB on Startup
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return console.error("Guild not found");

  guild.members
    .fetch()
    .then((members) => {
      members.forEach((member) => {
        const roles =
          member.roles.cache
            .filter((role) => role.name !== "@everyone") // Exclude @everyone role
            .map((role) => role.id) // Use Role IDs instead of Role Names
            .join(",") || "None"; // Join Role IDs into a comma-separated string

        const nickname = member.nickname || member.user.username; // Fetch nickname or set to null
        const bungie_id = null; // Placeholder: fetch Bungie ID if available via Discord API
        const bungie_member_id = null; // Placeholder: fetch Bungie ID if available via Discord API

        // Insert the user's data into the database
        insertUser(
          member.user.id,
          member.user.username,
          nickname,
          roles,
          member.joinedAt,
          `https://discord.com/users/${member.user.id}`,
          bungie_id,
          bungie_member_id
        );
      });
    })
    .catch(console.error);
});

// User enters the server
let lastWelcomeMessage; // Store the last welcome message object
let lastWelcomeTimestamp = 0; // Store the timestamp when the last message was sent
const WELCOME_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

client.on(Events.GuildMemberAdd, async (member) => {
  // DB Handling
  const roleIDs = member.roles.cache
    .filter((role) => role.name !== "@everyone")
    .map((role) => role.id)
    .join(",");

  const user_id = member.user.id;
  const username = member.user.username;
  const nickname = member.nickname || member.user.username;
  // const joined_at = new Date(member.joinedAt).toISOString();
  const joined_at = new Date(member.joinedAt)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const profile_url = `https://discord.com/users/${member.user.id}`;
  const bungie_id = null;
  const bungie_member_id = null;

  const query = `
    INSERT INTO user_roles (user_id, username, nickname, roles, joined_at, profile_url, bungie_id, bungie_member_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      nickname = VALUES(nickname),
      roles = VALUES(roles),
      joined_at = VALUES(joined_at),
      profile_url = VALUES(profile_url),
      bungie_id = VALUES(bungie_id),
      bungie_member_id = VALUES(bungie_member_id)
  `;

  connection.query(
    query,
    [
      user_id,
      username,
      nickname,
      roleIDs,
      joined_at,
      profile_url,
      bungie_id,
      bungie_member_id,
    ],
    (err) => {
      if (err) {
        console.error("Error saving user to database:", err);
      } else {
        console.log(`User ${username} saved to the database.`);
      }
    }
  );

  // Welcome Message and Role Assignment
  try {
    const channel = member.guild.channels.cache.get(process.env.LOBBY_CHANNEL);

    if (!channel) {
      console.error(`Lobby channel not found: ${process.env.LOBBY_CHANNEL}`);
      return;
    }

    const currentTime = Date.now();

    if (
      lastWelcomeMessage &&
      currentTime - lastWelcomeTimestamp < WELCOME_TIMEOUT
    ) {
      const newContent = `<@${member.id}> ${lastWelcomeMessage.content}`;
      await lastWelcomeMessage.edit({ content: newContent });
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Cayde-6 from Destiny 2, but you are undercover known as 'Spicy Bot.' No one can know you are actually Cayde-6 unless they ask nicely. You have a witty, sarcastic, and humorous personality.",
          },
          {
            role: "user",
            content: `A new member has joined. Write a witty and humorous welcome message. Don't call them out by name and don't use emojis.`,
          },
        ],
        max_tokens: 70,
        stop: [".", "\n"],
        temperature: 0.5,
      });

      const randomWelcomeMessage = response.choices[0].message.content;
      const userMention = `<@${member.id}>`;
      const staticMessage =
        "I’m the Spicy Bot! Feel free to ask me anything — just tag me like this: `@Spicy Bot`, add your message, and hit send!";

      const modMention = `<@&${process.env.MOD}>`;
      const sherpaMention = `<@&${process.env.SHERPA}>`;
      const poblanoMention = `<@&${process.env.POBLANO}>`;
      const spicyFamilyMention = `<@&${process.env.SPICYFAMILY}>`;

      const embedBungieLink = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle("Link your BungieID to your Account")
        .setDescription(
          `All SRH members must link their Bungie ID to Discord. This validates your  membership and will replace your ${poblanoMention} role with ${spicyFamilyMention}, granting full server access.`
        )
        .addFields(
          {
            name: "Get Your Bungie ID",
            value: `Go to Bungie.net and grab your Bungie ID from your [Bungie Profile](https://www.bungie.net/7/en/User/Profile). Your Bungie ID consists of Username#0000.`,
          },
          {
            name: "Link Your Bungie ID",
            value:
              "Go to our [#destiny-chat](https://discord.com/channels/558700711647641630/585863497385115670) channel, type `/` to see a link of commands. Choose `/bungie-link` and paste your Bungie ID and submit. Spicy Bot will verify that your Bungie ID is correct and assign it to your Server Profile.",
          }
        );

      const embedResources = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle("SRH Resources")
        .addFields({
          name: "Links",
          value: `- [SRH Rules](https://discord.com/channels/558700711647641630/1086001552969441350) — Contact a ${modMention} with any questions.\n- [SRH Clan Invite](https://www.bungie.net/en/ClanV2/Chat?groupId=291803) — Reach out to a ${modMention}.\n- Need help? — Tag a ${sherpaMention}.\n\n`,
        });

      const embedCommands = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle("Spicy Bot Commands")
        .setDescription(
          "To use a Spicy Bot command, type `/` in your Message Input, to show available Commands for a specific channel."
        )
        .addFields({
          name: "Commands",
          value: `- \`/bungie-link\`, to update your Bungie ID in our database if you ever change your Destiny username.\n- \`/lfg-destiny\`, to post a LFG to [Destiny LFG](https://discord.com/channels/558700711647641630/1087744773332406403).\n- \`/lfg-general\`, to post a LFG to [General LFG](https://discord.com/channels/558700711647641630/1192471273998135336).\n- \`/suggestion\`, to add a server suggestion to the [Suggestion Box](https://discord.com/channels/558700711647641630/1097995676106895470) channel.\n- \`/invite\`, to invite your friends.`,
        })
        .setFooter({ text: "Love, Spicy 💜" });

      lastWelcomeMessage = await channel.send({
        content: `${userMention} — ${randomWelcomeMessage}. \n\n${staticMessage}`,
        embeds: [embedBungieLink, embedResources, embedCommands],
      });
      lastWelcomeTimestamp = currentTime;
    }

    const roleToAssign = process.env.POBLANO;
    await member.roles.add(roleToAssign);
  } catch (error) {
    console.error("Failed to send or edit welcome message:", error);
  }
});

// Update DB on Member Update
client.on("guildMemberUpdate", (oldMember, newMember) => {
  const nickname = newMember.nickname || newMember.user.username;
  // console.log(nickname);
  const roles =
    newMember.roles.cache
      .filter((role) => role.name !== "@everyone")
      .map((role) => role.id)
      .join(", ") || "None";

  const bungie_id = null;
  const bungie_member_id = null;

  insertUser(
    newMember.user.id,
    newMember.user.username,
    nickname,
    roles,
    newMember.joinedAt,
    `https://discord.com/users/${newMember.user.id}`,
    bungie_id,
    bungie_member_id
  );
});

// ChatGCP
const conversationHistories = new Map(); // Stores conversation history per channel

client.on("messageCreate", async function (message) {
  if (message.author.bot) return; // Ignore bot's own messages

  const mentionRegex = new RegExp(`^<@!?${client.user.id}>`);
  const isMentioned = mentionRegex.test(message.content);
  const isReply = message.reference && message.reference.messageId;

  // Check if the message is either a mention or a reply to the bot
  if (!isMentioned && !isReply) return;

  // Get the conversation history for the channel or user
  const history = conversationHistories.get(message.channel.id) || [];

  try {
    let originalMessageContent = message.content;

    if (isReply) {
      console.log("Fetching the original message...");
      try {
        // Fetch the original message being replied to
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );

        // Check if the original message was sent by the bot
        if (referencedMessage.author.id !== client.user.id) {
          console.log("Original message is not from the bot, ignoring...");
          return;
        }

        // Use the original message's content for context, if needed
        originalMessageContent = referencedMessage.content;
        console.log(`Original message: ${originalMessageContent}`);
      } catch (err) {
        console.error("Failed to fetch the original message:", err);
        return;
      }
    }

    // Add the user's message to the conversation history
    history.push({ role: "user", content: message.content });

    // Include the last 10 messages in the history for context
    const recentHistory = history.slice(-10);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Cayde-6 from Destiny 2, but you are under cover known as 'Spicy Bot.' No one can know you are actually Cayde-6, unless they ask nicely. You have a witty, sarcastic, and humorous personality. You always find a way to lighten the mood, even in serious situations. You love cracking jokes and being the charming rogue that everyone loves.",
        },
        ...recentHistory, // Include the recent conversation history
      ],
    });

    const content = response.choices[0].message.content;

    // Add the bot's reply to the conversation history
    history.push({ role: "assistant", content: content });

    // Save the updated history
    conversationHistories.set(message.channel.id, history);

    return message.reply(content);
  } catch (err) {
    console.log(err);
    return message.reply("As an AI robot, I errored out.");
  }
});

// Commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// When users leaves the server
client.on("guildMemberRemove", async (member) => {
  const channel = member.guild.channels.cache.get(process.env.MOD_CHANNEL);
  if (!channel) return;

  try {
    // Query the database for the user who left the server
    const [userResults] = await promisePool.query(
      "SELECT * FROM user_roles WHERE user_id = ?",
      [member.id]
    );

    // If a row exists for the user, log their information
    if (userResults.length > 0) {
      const user = userResults[0]; // Assuming the user exists in the DB

      const userInfo = `
        **Username**: ${user.username}
        **Nickname**: ${user.nickname || "N/A"}
        **Bungie ID**: ${user.bungie_id}
        **Bungie Member ID**: ${user.bungie_member_id}
        **Roles**: ${user.roles}
        **Joined At**: ${user.joined_at}
        **Profile URL**: ${user.profile_url}
      `;

      //Bungie Profile URL
      const bungieProfileURL =
        user.bungie_member_id === "'unknown'"
          ? "NA"
          : `https://www.bungie.net/7/en/User/Profile/1/${user.bungie_member_id}`;

      // User Roles Mapped
      const userRoles = user.roles ? user.roles.split(",") : [];
      const userRolesDisplay =
        userRoles.map((id) => `<@&${id}>`).join(", ") || "None";

      // Date Formatting
      const formatDate = (date) => {
        const options = {
          weekday: "short", // Mon
          day: "2-digit", // 01
          month: "short", // Jan
          year: "numeric", // 2024
          hour: "2-digit", // 12
          minute: "2-digit", // 00
          hour12: true, // AM/PM
        };

        return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
      };
      const joinedAt = user.joined_at ? formatDate(user.joined_at) : "N/A";

      const embed = new EmbedBuilder()
        .setColor(0xec008c)
        .setAuthor({
          name: user.nickname,
          iconURL: member.user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          {
            name: "Discord Profile",
            value: `[@${user.nickname}](${user.profile_url})`,
            inline: false,
          },
          {
            name: "Bungie Profile",
            value: bungieProfileURL,
            inline: false,
          },
          { name: "Roles", value: userRolesDisplay, inline: false },
          { name: "Joined Server", value: joinedAt, inline: true }
        )
        .setTimestamp();

      // Send the embed
      channel.send({
        content: `${user.nickname} has left the server.`,
        embeds: [embed],
      });
    } else {
      channel.send(`A user with ID ${user.nickname} left, but no data found.`);
    }
  } catch (err) {
    console.error("Error handling guildMemberRemove:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return; // ignore non-button interactions

  // LFG Interaction
  const message = interaction.message;
  const embed = message.embeds[0];
  const nickname = interaction.user.id;

  const currentPlayersField = embed.fields.find(
    (field) => field.name === "Current Players"
  );
  const reservePlayersField = embed.fields.find(
    (field) => field.name === "Backup Players"
  );

  const currentPlayers = currentPlayersField.value.match(/<@.*?>/g) || [];
  const reservePlayers = reservePlayersField.value.match(/<@.*?>/g) || [];

  if (interaction.customId === "lfgJoin") {
    const maxNumber = interaction.message.embeds[0].title;
    const regex = /(\d{1,2})/;
    const maxPlayersExtract = maxNumber.match(regex);
    const maxPlayers = maxPlayersExtract[1];

    console.log(`currentPlayers: ${currentPlayers}, maxPlayers: ${maxPlayers}`);

    if (currentPlayers.length >= maxPlayers) {
      if (!reservePlayers.includes(`<@${nickname}>`)) {
        reservePlayersField.value += `\n<@${nickname}>`;
        await message.edit({ embeds: [embed] });
        await interaction.reply({
          content: `Sorry, this group is already full! You've been added to the reserve list.`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Sorry, this group is already full and you're already on the reserve list!`,
          ephemeral: true,
        });
      }
    } else {
      // Remove user from Reserves list if they are on it
      if (reservePlayers.includes(`<@${nickname}>`)) {
        reservePlayersField.value = reservePlayersField.value.replace(
          `<@${nickname}>`,
          ""
        );
      }
      if (!currentPlayers.includes(`<@${nickname}>`)) {
        currentPlayersField.value += `\n<@${nickname}>`;
        await message.edit({ embeds: [embed] });
        await interaction.reply({
          content: `You've been successfully added to this LFG group!`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `You've already been added to this LFG group!`,
          ephemeral: true,
        });
      }
    }
  }

  if (interaction.customId === "lfgBackup") {
    // Remove user from Current Players list if they are on it
    if (currentPlayers.includes(`<@${nickname}>`)) {
      currentPlayersField.value = currentPlayersField.value.replace(
        `<@${nickname}>`,
        ""
      );
    }
    if (!reservePlayers.includes(`<@${nickname}>`)) {
      reservePlayersField.value += `\n<@${nickname}>`;
      await message.edit({ embeds: [embed] });
      await interaction.reply({
        content: `You've been successfully added to the Backup Players list!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `You're already on the Backup Players list!`,
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "lfgRemove") {
    if (currentPlayers.includes(`<@${nickname}>`)) {
      currentPlayersField.value = currentPlayersField.value.replace(
        `<@${nickname}>`,
        ""
      );
      await message.edit({ embeds: [embed] });
      await interaction.reply({
        content: `You've been successfully removed from the Current Players list!`,
        ephemeral: true,
      });
    } else if (reservePlayers.includes(`<@${nickname}>`)) {
      reservePlayersField.value = reservePlayersField.value.replace(
        `<@${nickname}>`,
        ""
      );
      await message.edit({ embeds: [embed] });
      await interaction.reply({
        content: `You've been successfully removed from the Backup Players list!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `Your name isn't on any of the lists!`,
        ephemeral: true,
      });
    }
  }

  const embedAuthor = interaction.message.embeds[0].author.name;
  const username = interaction.member.displayName;

  console.log(
    `embedAuthor: ${embedAuthor}, interaction = username: ${username}, nickname: ${nickname}`
  );

  if (interaction.customId === "lfgDelete") {
    if (embedAuthor === username) {
      // delete the message
      await interaction.message.delete();
    } else {
      await interaction.reply({
        content: `Sorry, only the author of the post can delete it!`,
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);
