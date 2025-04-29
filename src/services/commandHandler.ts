import { Client, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

/**
 * Interface para comandos do Discord
 */
export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * Declares the commands property on the Client interface of Discord.js
 */
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

/**
 * Loads all commands from the commands/ folder and registers them on the client
 * @param client Discord.js client
 */
async function loadCommands(client: Client): Promise<void> {
  try {
    // Initializes the collection if it doesn't exist
    if (!client.commands) {
      client.commands = new Collection<string, Command>();
    }

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;

        // Command validations
        if (!command.data) {
          logger.warn(`Command ${file} does not have 'data' property`);
          continue;
        }

        if (!command.execute || typeof command.execute !== 'function') {
          logger.warn(`Commman ${file} deessnntahaveecute' met methodhod`);
          continue;
        }

        // Adds the command to the collection
        client.commands.set(command.data.name, command);
        logger.info(`Command loaded: ${file} [${command.data.name}]`);
      } catch (error) {
        logger.error(`Error loading command ${file}`, error as Error);
      }
    }

    logger.info(`Total of ${client.commands.size} commands loaded`);
  } catch (error) {
    logger.error('Error loading commands', error as Error);
  }
}

/**
 * Registers the interactionCreate event for command handling
 * @param client Discord.js client
 */
function registerCommandHandler(client: Client): void {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Command not found: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction as CommandInteraction);
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}`, error as Error);

      const errorMessage = 'An error occurred while executing this command!';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });

  logger.info('Command interaction handler registered');
}

export default {
  loadCommands,
  registerCommandHandler,
};
