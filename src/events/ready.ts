import { Client, Events } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import logger from '../utils/logger';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  if (client.user) {
    logger.info(`${BOT_CONFIG.NAME} is online! Logged in as ${client.user.tag}`);

    // Log intents for debugging
    logger.debug(`Bot intents: ${JSON.stringify(Object.keys(client.options.intents))}`);
  }
}
