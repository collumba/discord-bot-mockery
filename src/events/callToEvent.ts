import { Client, Events, TextChannel } from 'discord.js';
import { startCallTo, CallToType } from '../services/callToService';
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
 * Executes a random call to action in the default channel
 * @param client Discord client
 */
async function executeCallTo(client: Client): Promise<void> {
  try {
    // Ensure we have a channel ID configured
    if (!BOT_CONFIG.CALL_TO.DEFAULT_CHANNEL_ID) {
      logger.warn('No default channel ID configured for automatic Call To Action');
      return;
    }

    // Get the channel
    const channel = await client.channels.fetch(BOT_CONFIG.CALL_TO.DEFAULT_CHANNEL_ID);

    if (!channel || !(channel instanceof TextChannel)) {
      logger.warn(
        `Invalid channel for automatic Call To Action: ${BOT_CONFIG.CALL_TO.DEFAULT_CHANNEL_ID}`
      );
      return;
    }

    // Select random type and execute
    const type = getRandomCallToType();
    logger.info(`Executing automatic Call To Action of type: ${type}`);

    const success = await startCallTo(channel, type);

    if (success) {
      logger.info(`Automatic Call To Action of type ${type} sent successfully`);
    } else {
      logger.warn(`Failed to send automatic Call To Action of type ${type}`);
    }
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
