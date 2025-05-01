import { GuildConfig } from '../models/GuildConfig';
import logger from '../utils/logger';

/**
 * Sets the active channel for a guild
 * @param guildId - Discord guild ID
 * @param channelId - Discord channel ID where the bot is allowed to operate
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function setActiveChannel(guildId: string, channelId: string): Promise<boolean> {
  try {
    await GuildConfig.findOneAndUpdate({ guildId }, { channelId }, { upsert: true, new: true });

    logger.info(`Set active channel for guild ${guildId} to ${channelId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to set active channel for guild ${guildId}:`, error as Error);
    return false;
  }
}

/**
 * Gets the active channel for a guild
 * @param guildId - Discord guild ID
 * @returns Promise resolving to the channel ID if found, null otherwise
 */
export async function getActiveChannel(guildId: string): Promise<string | null> {
  try {
    const config = await GuildConfig.findOne({ guildId });
    return config ? config.channelId : null;
  } catch (error) {
    logger.error(`Failed to get active channel for guild ${guildId}:`, error as Error);
    return null;
  }
}

/**
 * Checks if the bot is in the active channel for a guild
 * @param interactionOrMessage - Discord interaction or message object
 * @returns Promise resolving to true if in active channel or no config exists, false otherwise
 */
export async function isInActiveChannel(
  interactionOrMessage: { guildId?: string | null; channelId: string } | null
): Promise<boolean> {
  // If no interaction/message or no guild (DM), allow
  if (!interactionOrMessage || !interactionOrMessage.guildId) {
    return true;
  }

  const { guildId, channelId } = interactionOrMessage;

  // Get the active channel for this guild
  const activeChannelId = await getActiveChannel(guildId);

  // If no active channel is set (no config exists), allow all channels
  if (!activeChannelId) {
    return true;
  }

  // Check if the current channel matches the configured channel
  return channelId === activeChannelId;
}

export default {
  setActiveChannel,
  getActiveChannel,
  isInActiveChannel,
};
