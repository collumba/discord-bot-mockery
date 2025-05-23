import { Client, Events, TextChannel, Guild } from 'discord.js';
import { startCallTo, CallToType } from '../services/callToService';
import { getActiveChannel } from '../services/guildConfigService';
import logger from '../utils/logger';
import BOT_CONFIG from '../config/botConfig';

export const name = Events.ClientReady;
export const once = true;

// Store the timeout to allow clearing it if needed
let callToTimeout: NodeJS.Timeout | null = null;

/**
 * Generates a random delay between min and max milliseconds
 * @returns Random delay in milliseconds
 */
function getRandomDelay(): number {
  const minDelay = BOT_CONFIG.CALL_TO.MIN_DELAY * 60 * 1000; // Convert minutes to ms
  const maxDelay = BOT_CONFIG.CALL_TO.MAX_DELAY * 60 * 1000; // Convert minutes to ms

  return Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
}

/**
 * Selects a random CallTo type from available options
 * @returns Random CallTo type
 */
function getRandomCallToType(): CallToType {
  const types: CallToType[] = ['play', 'chat', 'event'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Schedules the next automatic call to action
 * @param client Discord client
 */
function scheduleNextCallTo(client: Client): void {
  // Clear any existing timeout
  if (callToTimeout) {
    clearTimeout(callToTimeout);
    callToTimeout = null;
  }

  // If not enabled, don't schedule
  if (!BOT_CONFIG.CALL_TO.AUTO_ENABLED) {
    logger.info('Automatic Call To Action is disabled');
    return;
  }

  // Calculate random delay
  const delay = getRandomDelay();
  const minutes = Math.floor(delay / 60000);

  logger.info(`Scheduling next automatic Call To Action in ${minutes} minutes`);

  // Set timeout for next call
  callToTimeout = setTimeout(() => {
    executeCallTo(client)
      .catch((error) => {
        logger.error(
          `Error in automatic Call To Action: ${error instanceof Error ? error.message : String(error)}`
        );
      })
      .finally(() => {
        // Schedule the next call regardless of success/failure
        scheduleNextCallTo(client);
      });
  }, delay);
}

/**
 * Tries to execute call to action in a single guild
 * @param guild The guild to execute call to action in
 * @param client Discord client
 * @returns True if successful, false otherwise
 */
async function executeCallToInGuild(guild: Guild, client: Client): Promise<boolean> {
  try {
    // Get the active channel ID from guild configuration
    const activeChannelId = await getActiveChannel(guild.id);

    // Skip if no active channel is configured
    if (!activeChannelId) {
      logger.debug(`No active channel configured for guild ${guild.id}, skipping call to action`);
      return false;
    }

    // Get the channel
    const channel = await client.channels.fetch(activeChannelId);

    if (!channel || !(channel instanceof TextChannel)) {
      logger.warn(`Invalid active channel for guild ${guild.id}: ${activeChannelId}`);
      return false;
    }

    // Select random type and execute
    const type = getRandomCallToType();
    logger.info(`Executing automatic Call To Action of type ${type} in guild ${guild.id}`);

    const success = await startCallTo(channel, type);

    if (success) {
      logger.info(
        `Automatic Call To Action of type ${type} sent successfully to guild ${guild.id}`
      );
      return true;
    } else {
      logger.warn(`Failed to send automatic Call To Action of type ${type} to guild ${guild.id}`);
      return false;
    }
  } catch (error) {
    logger.error(
      `Error in executeCallToInGuild for guild ${guild.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return false;
  }
}

/**
 * Executes a random call to action in all guilds with active channels
 * @param client Discord client
 */
async function executeCallTo(client: Client): Promise<void> {
  try {
    // Get all guilds the bot is in
    const guilds = client.guilds.cache;

    if (guilds.size === 0) {
      logger.info('Bot is not in any guilds, skipping call to action');
      return;
    }

    logger.info(`Attempting to send call to action to ${guilds.size} guilds`);

    // Track success count
    let successCount = 0;

    // Process each guild in sequence
    for (const [guildId, guild] of guilds) {
      const success = await executeCallToInGuild(guild, client);
      if (success) {
        successCount++;
      }
    }

    logger.info(`Call to action executed successfully in ${successCount}/${guilds.size} guilds`);
  } catch (error) {
    logger.error(
      `Error in executeCallTo: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error; // Re-throw for the caller to handle
  }
}

/**
 * Main execute function that runs when the bot is ready
 * @param client Discord client
 */
export async function execute(client: Client): Promise<void> {
  logger.info('Initializing automatic Call To Action system...');

  // Schedule the first call to action
  scheduleNextCallTo(client);
}
