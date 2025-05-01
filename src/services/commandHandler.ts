import {
  Client,
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { guardActiveChannel } from '../utils/activeChannelGuard';
import { t } from '../services/i18nService';

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
 * Registers the interactionCreate event for commands,
 * with active channel verification
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
      // Check if the command can be executed in this channel
      if (await guardActiveChannel(interaction as ChatInputCommandInteraction)) {
        // If passed the verification, execute the command
        await command.execute(interaction as CommandInteraction);
      }
      // If not passed, the guardActiveChannel already responded to the user
    } catch (error) {
      logger.error(`Error executing command ${interaction.commandName}`, error as Error);

      const errorMessage = t('errors.execution');

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });

  logger.info('Command interaction handler registered with active channel check');
}

export default {
  loadCommands,
  registerCommandHandler,
};
