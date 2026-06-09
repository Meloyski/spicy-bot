import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
dotenv.config();

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

const commands = [];
for (const file of commandFiles) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandModule = require(path.join(commandsPath, file));
  const command = commandModule.default ?? commandModule;
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
      { body: commands }
    ) as unknown[];
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
