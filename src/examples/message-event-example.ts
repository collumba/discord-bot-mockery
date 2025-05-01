import { Client, Events, Message } from 'discord.js';
import { isInActiveChannel } from '../services/guildConfigService';
import { t } from '../services/i18nService';
import logger from '../utils/logger';

export const name = Events.MessageCreate;
export const once = false;

/**
 * Handle incoming messages
 * @param message The received message
 */
export async function execute(message: Message): Promise<void> {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the message is in the active channel before proceeding
  if (!(await isInActiveChannel(message))) {
    // No need to reply - just silently ignore messages in non-active channels
    return;
  }

  // Message handling logic goes here
  // This will only execute if the message is in the active channel
  logger.info(`Processing message in active channel: ${message.content}`);

  // Example response
  if (message.content.toLowerCase() === 'hello') {
    await message.reply(t('commands.set_active_channel.examples.message_response'));
  }
}
