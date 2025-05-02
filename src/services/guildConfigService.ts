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
 * Gets the allowed role IDs for a guild
 * @param guildId - Discord guild ID
 * @returns Promise resolving to array of role IDs if found, empty array otherwise
 */
export async function getAllowedRoleIds(guildId: string): Promise<string[]> {
  try {
    const config = await GuildConfig.findOne({ guildId });
    return config?.allowedRoleIds || [];
  } catch (error) {
    logger.error(`Failed to get allowed roles for guild ${guildId}:`, error as Error);
    return [];
  }
}

/**
 * Adds a role ID to the list of allowed roles
 * @param guildId - Discord guild ID
 * @param roleId - Discord role ID to add
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function addAllowedRole(guildId: string, roleId: string): Promise<boolean> {
  try {
    const config = await GuildConfig.findOne({ guildId });

    if (config) {
      // If the role is already in the list, don't add it again
      if (config.allowedRoleIds.includes(roleId)) {
        return true;
      }

      // Add the new role ID
      config.allowedRoleIds.push(roleId);
      await config.save();
    } else {
      // Create new config with this role
      await GuildConfig.create({
        guildId,
        channelId: '', // Default empty string for channelId
        allowedRoleIds: [roleId],
      });
    }

    logger.info(`Added role ${roleId} to allowed roles for guild ${guildId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to add allowed role for guild ${guildId}:`, error as Error);
    return false;
  }
}

/**
 * Removes a role ID from the list of allowed roles
 * @param guildId - Discord guild ID
 * @param roleId - Discord role ID to remove
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function removeAllowedRole(guildId: string, roleId: string): Promise<boolean> {
  try {
    const config = await GuildConfig.findOne({ guildId });

    if (config) {
      // Filter out the role ID to remove
      config.allowedRoleIds = config.allowedRoleIds.filter((id) => id !== roleId);
      await config.save();

      logger.info(`Removed role ${roleId} from allowed roles for guild ${guildId}`);
    }

    return true;
  } catch (error) {
    logger.error(`Failed to remove allowed role for guild ${guildId}:`, error as Error);
    return false;
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
  getAllowedRoleIds,
  addAllowedRole,
  removeAllowedRole,
};
