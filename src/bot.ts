import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import loadEvents from './services/eventHandler';
import commandHandler from './services/commandHandler';
import { connectMongo } from './database/mongo';
import logger from './utils/logger';
import { initI18n } from './services/i18nService';

// Load environment variables
config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
}) as Client & { commands: Collection<string, any> };

(async () => {
  try {
    // Initialize i18n service
    logger.info('Initializing i18n service...');
    initI18n(['pt', 'en']);

    // Connect to MongoDB
    logger.info('Starting MongoDB connection...');
    await connectMongo();

    // Load events
    logger.info('Loading events...');
    await loadEvents(client);

    // Load commands
    logger.info('Loading commands...');
    await commandHandler.loadCommands(client);

    // Register interaction listener
    logger.info('Registering interaction listener...');
    await commandHandler.registerCommandHandler(client);

    // Connect to Discord
    logger.info('Connecting to Discord...');
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot connected successfully!');
  } catch (error) {
    logger.error('Failed to initialize bot:', error as Error);
    process.exit(1);
  }
})();
