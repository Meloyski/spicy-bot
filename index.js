const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
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

// client.on(Events.InteractionCreate, (interaction) => {
//   const member = interaction.member;

//   if (interaction.customId === "addRole") {
//     member.roles.add(role);
//     interaction.reply({
//       content: `You now have the ${role.name} role.`,
//       ephemeral: true,
//     });
//   }

//   if (interaction.customId === "removeRole") {
//     member.roles.remove(role);
//     interaction.reply({
//       content: `The ${role.name} role has been removed.`,
//       ephemeral: true,
//     });
//   }
// });

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

  const hunters = member.guild.roles.cache.find(
    (role) => role.name === "Hunters"
  );
  const titans = member.guild.roles.cache.find(
    (role) => role.name === "Titans"
  );
  const warlocks = member.guild.roles.cache.find(
    (role) => role.name === "Warlocks"
  );

  if (interaction.customId === "addHunter") {
    const role = hunters;
    if (!role) return console.log("Role not found!"); // If the role is not found, log a message and return
    try {
      await member.roles.add(role);
      await member.roles.remove(titans);
      await member.roles.remove(warlocks);
      await interaction.reply({
        content: `Cayde would say something funny about now! Welcome to ${role}`,
        ephemeral: true,
      }); // Send a confirmation message
    } catch (error) {
      console.log(error);
      await interaction.reply("Something went wrong while adding the role!"); // Send an error message
    }
  }

  if (interaction.customId === "addTitan") {
    const role = titans;
    if (!role) return console.log("Role not found!"); // If the role is not found, log a message and return
    try {
      await member.roles.add(role);
      await member.roles.remove(hunters);
      await member.roles.remove(warlocks);
      await interaction.reply({
        content: `Zavala would say indeed! Welcome to ${role}`,
        ephemeral: true,
      }); // Send a confirmation message
    } catch (error) {
      console.log(error);
      await interaction.reply("Something went wrong while adding the role!"); // Send an error message
    }
  }

  if (interaction.customId === "addWarlock") {
    const role = warlocks;
    if (!role) return console.log("Role not found!"); // If the role is not found, log a message and return
    try {
      await member.roles.add(role);
      await member.roles.remove(hunters);
      await member.roles.remove(titans);
      await interaction.reply({
        content: `Ikora would be proud! Welcome to ${role}`,
        ephemeral: true,
      }); // Send a confirmation message
    } catch (error) {
      console.log(error);
      await interaction.reply("Something went wrong while adding the role!"); // Send an error message
    }
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
});

client.login(process.env.TOKEN);
