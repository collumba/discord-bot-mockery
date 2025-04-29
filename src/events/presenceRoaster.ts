import {
  Client,
  Events,
  Presence,
  TextChannel,
  ActivityType,
  EmbedBuilder,
  ChannelType,
} from 'discord.js';
import logger from '../utils/logger';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export const name = Events.PresenceUpdate;
export const once = false;

// Map to track cooldowns by user ID
const cooldowns = new Map<string, number>();

/**
 * Checks if a user is in cooldown
 * @param userId User ID to check
 * @returns True if user is in cooldown
 */
function isInCooldown(userId: string): boolean {
  const lastRoasted = cooldowns.get(userId);
  if (!lastRoasted) return false;

  const cooldownTime = BOT_CONFIG.PRESENCE_ROASTER.COOLDOWN_TIME * 60 * 1000; // Convert minutes to ms
  return Date.now() - lastRoasted < cooldownTime;
}

/**
 * Sets a cooldown for a user
 * @param userId User ID to set cooldown for
 */
function setCooldown(userId: string): void {
  cooldowns.set(userId, Date.now());
}

/**
 * Gets the remaining cooldown time in seconds
 * @param userId User ID to check
 * @returns Remaining cooldown time in seconds
 */
function getRemainingCooldown(userId: string): number {
  const lastRoasted = cooldowns.get(userId);
  if (!lastRoasted) return 0;

  const cooldownTime = BOT_CONFIG.PRESENCE_ROASTER.COOLDOWN_TIME * 60 * 1000; // Convert minutes to ms
  const remaining = cooldownTime - (Date.now() - lastRoasted);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Cleans up expired cooldowns to prevent memory leaks
 */
function cleanupCooldowns(): void {
  const now = Date.now();
  const cooldownTime = BOT_CONFIG.PRESENCE_ROASTER.COOLDOWN_TIME * 60 * 1000; // Convert minutes to ms

  for (const [userId, timestamp] of cooldowns.entries()) {
    if (now - timestamp >= cooldownTime) {
      cooldowns.delete(userId);
    }
  }
}

/**
 * Gets a game-specific roast from i18n
 * @param gameName Game name to get roasts for
 * @returns Random roast phrase for the game
 */
function getGameRoast(gameName: string): string {
  const normalizedGame = gameName.toLowerCase();
  const gameKeys = [
    'league_of_legends',
    'valorant',
    'fortnite',
    'minecraft',
    // Add more game keys as needed
  ];

  // Check if we have specific roasts for this game
  let translationKey = 'services.presenceRoaster.games.default';
  for (const key of gameKeys) {
    if (normalizedGame.includes(key) || key.includes(normalizedGame)) {
      translationKey = `services.presenceRoaster.games.${key}`;
      break;
    }
  }

  // Get the roasts from i18n
  const roastsStr = t(translationKey);

  // Split by comma+dot if it's a single string (how the i18n system joins arrays)
  const roasts = Array.isArray(roastsStr) ? roastsStr : roastsStr.split('.,');

  // Get a random roast
  return roasts[Math.floor(Math.random() * roasts.length)];
}

/**
 * Sends a roast message to the target channel
 * @param channel Target channel
 * @param username Username to roast
 * @param gameName Game name
 * @param roastMessage Roast message
 * @returns True if successful
 */
async function sendRoastMessage(
  channel: TextChannel,
  username: string,
  gameName: string,
  roastMessage: string
): Promise<boolean> {
  try {
    // Create an embed for the roast
    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(t('services.presenceRoaster.embed.title', { game: gameName }))
      .setDescription(`Hey **${username}**, ${roastMessage}`)
      .setFooter({
        text: t('services.presenceRoaster.embed.footer', { botName: BOT_CONFIG.NAME }),
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    logger.error(
      `Error sending roast message: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

/**
 * Handle presence update event
 * @param oldPresence Previous presence state (can be null)
 * @param newPresence New presence state
 * @param client Discord client
 */
export async function execute(
  oldPresence: Presence | null,
  newPresence: Presence,
  client: Client
): Promise<void> {
  try {
    // Skip if feature is disabled
    if (!BOT_CONFIG.PRESENCE_ROASTER.ENABLED) return;

    // Clean up cooldowns periodically (1% chance on each event to avoid doing it too often)
    if (Math.random() < 0.01) {
      cleanupCooldowns();
    }

    const member = newPresence.member;
    if (!member) return;

    // Skip bots
    if (member.user.bot) return;

    // Skip if we don't have a channel to send to
    if (!BOT_CONFIG.PRESENCE_ROASTER.DEFAULT_CHANNEL_ID) {
      return;
    }

    // Check if this is a new playing activity
    const playingActivity = newPresence.activities.find(
      (activity) => activity.type === ActivityType.Playing
    );

    // No playing activity found
    if (!playingActivity) return;

    // If old presence had the same game, skip (they didn't just start playing)
    if (
      oldPresence &&
      oldPresence.activities.some(
        (activity) =>
          activity.type === ActivityType.Playing && activity.name === playingActivity.name
      )
    ) {
      return;
    }

    const gameName = playingActivity.name;
    const userId = member.user.id;
    const username = member.displayName;

    // Check if user is in cooldown
    if (isInCooldown(userId)) {
      logger.debug(`User ${username} is in cooldown for ${getRemainingCooldown(userId)} seconds`);
      return;
    }

    // Random chance to roast (20% by default)
    if (Math.random() > BOT_CONFIG.PRESENCE_ROASTER.ROAST_CHANCE) {
      return;
    }

    // Get a random roast message for the game
    const roastMessage = getGameRoast(gameName);

    // Get the target channel
    try {
      const channel = await client.channels.fetch(BOT_CONFIG.PRESENCE_ROASTER.DEFAULT_CHANNEL_ID);
      if (!channel || !(channel instanceof TextChannel)) {
        logger.warn(
          `Invalid channel for game roasting: ${BOT_CONFIG.PRESENCE_ROASTER.DEFAULT_CHANNEL_ID}`
        );
        return;
      }

      // Send the roast message
      logger.info(`Roasting ${username} for playing ${gameName}`);
      const success = await sendRoastMessage(channel, username, gameName, roastMessage);

      if (success) {
        // Set cooldown for this user
        setCooldown(userId);
        logger.info(`Roasted ${username} for playing ${gameName} successfully`);
      }
    } catch (error) {
      logger.error(
        `Error fetching channel: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } catch (error) {
    logger.error(
      `Error in presence roaster: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
