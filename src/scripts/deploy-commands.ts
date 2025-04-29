import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = require(filePath).default;

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`Command added for deployment: ${command.data.name}`);
    } else {
      console.warn(
        `[WARNING] The command in ${filePath} is missing the required properties 'data' or 'execute'.`
      );
    }
  } catch (error) {
    console.error(`[ERROR] Error loading command ${filePath}:`, error);
  }
}

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error(
    '[ERROR] The DISCORD_TOKEN and/or DISCORD_CLIENT_ID environment variables are not configured!'
  );
  process.exit(1);
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Starting deployment of ${commands.length} commands...`);

    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(
      `Deployment of ${Array.isArray(data) ? data.length : 0} commands completed successfully!`
    );
  } catch (error) {
    console.error('[ERROR] Error deploying commands:', error);
  }
})();
