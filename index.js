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
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
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

// Adding the Role Mod Interaction to index.js to maintain usability on Bot restarts
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return; // ignore non-button interactions

  const member = interaction.member;

  const roles = {
    Hunters: {
      role: member.guild.roles.cache.find((role) => role.name === "Hunters"),
      message: "Cayde would say something funny about now!",
    },
    Titans: {
      role: member.guild.roles.cache.find((role) => role.name === "Titans"),
      message: "Zavala would say indeed!",
    },
    Warlocks: {
      role: member.guild.roles.cache.find((role) => role.name === "Warlocks"),
      message: "Ikora would be proud!",
    },
  };

  switch (interaction.customId) {
    case "addHunter":
      addRole(roles.Hunters.role, roles.Hunters.message);
      removeRoles([roles.Titans.role, roles.Warlocks.role]);
      break;
    case "addTitan":
      addRole(roles.Titans.role, roles.Titans.message);
      removeRoles([roles.Hunters.role, roles.Warlocks.role]);
      break;
    case "addWarlock":
      addRole(roles.Warlocks.role, roles.Warlocks.message);
      removeRoles([roles.Hunters.role, roles.Titans.role]);
      break;
    default:
      console.log("Invalid custom ID");
      break;
  }

  async function addRole(role, message) {
    if (!role) {
      console.log("Role not found!");
      return;
    }

    try {
      await member.roles.add(role);
      await interaction.reply({
        content: `${message} Welcome to ${role}`,
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
      await interaction.reply("Something went wrong while adding the role!");
    }
  }

  async function removeRoles(roles) {
    try {
      await member.roles.remove(roles);
    } catch (error) {
      console.log(error);
    }
  }

  if (interaction.command === "bungie-id") {
    // Your code to execute when the 'verify' command is called goes here
    await interaction.reply("Test");
    console.log("test");
  }

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

    ////////
  }

  // Add Role (Mod) for test server
  if (interaction.customId === "addRole") {
    const role = member.guild.roles.cache.find((role) => role.name === "Mod");
    if (!role) return console.log("Role not found!"); // If the role is not found, log a message and return
    try {
      await member.roles.add(role);
      await interaction.reply({
        content: `Role "${role.name}" added!`,
        ephemeral: true,
      }); // Send a confirmation message
    } catch (error) {
      console.log(error);
      await interaction.reply("Something went wrong while adding the role!"); // Send an error message
    }
  }

  // Add Role (Mod) for test server
  if (interaction.customId === "removeRole") {
    const role = member.guild.roles.cache.find((role) => role.name === "Mod");
    if (!role) return console.log("Role not found!"); // If the role is not found, log a message and return
    try {
      await member.roles.remove(role);
      await interaction.reply({
        content: `Role "${role.name}" removed!`,
        ephemeral: true,
      }); // Send a confirmation message
    } catch (error) {
      console.log(error);
      await interaction.reply("Something went wrong while adding the role!"); // Send an error message
    }
  }
  ///////////////////End Role Interaction

  // LFG Interaction
  const message = interaction.message;
  const embed = message.embeds[0];
  const nickname = interaction.user.id;

  const currentPlayersField = embed.fields.find(
    (field) => field.name === "Current Players"
  );
  const reservePlayersField = embed.fields.find(
    (field) => field.name === "Reserve Players"
  );

  const currentPlayers = currentPlayersField.value.match(/<@.*?>/g) || [];
  const reservePlayers = reservePlayersField.value.match(/<@.*?>/g) || [];

  if (interaction.customId === "lfgJoin") {
    const maxPlayers = interaction.message.embeds[0].title[2];
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
        content: `You've been successfully added to the reserve players list!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `You're already on the reserve players list!`,
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
        content: `You've been successfully removed from the current players list!`,
        ephemeral: true,
      });
    } else if (reservePlayers.includes(`<@${nickname}>`)) {
      reservePlayersField.value = reservePlayersField.value.replace(
        `<@${nickname}>`,
        ""
      );
      await message.edit({ embeds: [embed] });
      await interaction.reply({
        content: `You've been successfully removed from the reserve players list!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `Your name isn't on any of the lists!`,
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "lfgDelete") {
    if (embedAuthor === interaction.user.username) {
      // delete the message
      await message.delete();
    } else {
      await interaction.reply({
        content: `Sorry, only the author of the post can delete it!`,
        ephemeral: true,
      });
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  // Modal Interaction
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === "bungie") {
    await interaction.reply({
      content: "Your Bungie ID has been submitted!",
      ephemeral: true,
    });

    const bungieId = interaction.fields.getTextInputValue("bungie-id-name");
    // const displayName = interaction.member.displayName;

    await interaction.member.setNickname(bungieId);
  }

  // const verifiedRole = message.guild.roles.cache.find(
  //   (role) => role.name === "Verified"
  // );

  // await mentionedMember.roles.add(verifiedRole);
});

client.login(process.env.TOKEN);
