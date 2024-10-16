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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Old OpenAI
// const openai = new OpenAIApi(
//   new Configuration({
//     apiKey: process.env.AI_TOKEN,
//   })
// );

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

// User enters the server
let lastWelcomeMessage; // Store the last welcome message object
let lastWelcomeTimestamp = 0; // Store the timestamp when the last message was sent
const WELCOME_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = member.guild.channels.cache.get(process.env.LOBBY_CHANNEL);

    if (!channel) {
      console.error(`Lounge channel not found: ${process.env.LOBBY_CHANNEL}`);
      return;
    }

    const currentTime = Date.now();

    // Check if the last welcome message was sent within the last 6 hours
    if (
      lastWelcomeMessage &&
      currentTime - lastWelcomeTimestamp < WELCOME_TIMEOUT
    ) {
      // Add the new user's mention to the existing message
      const newContent = `<@${member.id}> ${lastWelcomeMessage.content}`;
      await lastWelcomeMessage.edit({
        content: newContent,
      });
    } else {
      // Generate a new welcome message if more than 6 hours have passed or no message exists
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Cayde-6 from Destiny 2, but you are undercover known as 'Spicy Bot.' No one can know you are actually Cayde-6 unless they ask nicely. You have a witty, sarcastic, and humorous personality. You always find a way to lighten the mood, even in serious situations. You love cracking jokes and being the charming rogue that everyone loves.",
          },
          {
            role: "user",
            content: `A new member has joined. Write a witty and humorous welcome message. You don't need to call them out by name. Don't use emojis.`,
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

      const modRole = "585861532798156810";
      const modMention = `<@&${modRole}>`;

      const sherpaRole = "1121098728330235964";
      const sherpaMention = `<@&${sherpaRole}>`;

      // Create an embed for the static message
      const embedSpicy = new EmbedBuilder()
        .setColor(0xec008c)
        .setTitle("Additional Resources & Commands\n\n")
        .addFields(
          {
            name: "SRH Resources",
            value: `- [SRH Rules](https://discord.com/channels/558700711647641630/1086001552969441350) — Contact a ${modMention} with any questions or concerns.\n- [SRH Clan Invite](https://www.bungie.net/en/ClanV2/Chat?groupId=291803) — Reach out to one of our ${modMention} to get the in-game Clan invite. \n- Need help? — Tag a ${sherpaMention} to get in-game help.\n- Use our LFG! — Check out our [Destiny LFG](https://discord.com/channels/558700711647641630/1087744773332406403) and [General Gaming LFG](https://discord.com/channels/558700711647641630/1192471273998135336) channels.\n- Customize your server experience — Check out the 'Channels & Roles' at the top of your server menu.\n\n `,
          },
          {
            name: "Spicy Bot Commands",
            value:
              "To use a command, type `/`, select a command, then follow the prompts.\n- `/lfg-destiny`, to post a LFG to [Destiny LFG](https://discord.com/channels/558700711647641630/1087744773332406403).\n- `/lfg-general`, to post a LFG to [General LFG](https://discord.com/channels/558700711647641630/1192471273998135336).\n- `/suggestion`, to add a server suggestion to the [Suggestion Box](https://discord.com/channels/558700711647641630/1097995676106895470) channel.\n- `/invite`, invite your friends.\n\n",
          }
        )
        .setFooter({
          text: "Love,\n- Spicy 💜",
        });

      // Send the new welcome message and store the message object and timestamp
      lastWelcomeMessage = await channel.send({
        content: `${userMention} — ${randomWelcomeMessage}. \n\n${staticMessage}`,
        embeds: [embedSpicy],
      });
      lastWelcomeTimestamp = currentTime;
    }
  } catch (error) {
    console.error("Failed to send or edit welcome message:", error);
  }
});

//User leaves the server
client.on("guildMemberRemove", (member) => {
  const channel = member.guild.channels.cache.get(process.env.ADMIN_CHANNEL);
  if (!channel) return;

  channel.send(`${member.user.tag} has left the server.`);
});

// Adding the Role Mod Interaction to index.js to maintain usability on Bot restarts
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return; // ignore non-button interactions

  // Verified
  if (interaction.customId === "verified") {
    const message = interaction.message;
    const mentionedUser = message.mentions.users.first();
    const verifiedRole = message.guild.roles.cache.find(
      (role) => role.name === "Verified"
    );

    if (!verifiedRole) return console.error("Role not found.");
    const mentionedMember = message.guild.members.cache.get(mentionedUser.id);
    if (!mentionedMember) return console.error("Member not found.");

    await mentionedMember.roles.add(verifiedRole);

    // Disable the button
    const verifiedButton = new ButtonBuilder()
      .setCustomId("verified")
      .setLabel("Already Verified")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true);

    message.components[0].components[0] = verifiedButton;

    await message.edit({ components: message.components });

    await interaction.reply(
      `<@!${mentionedMember.user.id}> has been verified by <@!${interaction.user.id}>.`
    );
  }

  //////// End Verify

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
