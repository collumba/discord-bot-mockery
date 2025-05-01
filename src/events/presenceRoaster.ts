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
import BOT_CONFIG, { PRESENCE_ROASTER_CONFIG } from '../config/botConfig';
import { t } from '../services/i18nService';
import { getActiveChannel } from '../services/guildConfigService';
import { getReliableRoast } from '../services/roastAI';

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

  const cooldownTime = PRESENCE_ROASTER_CONFIG.COOLDOWN_TIME * 60 * 1000; // Convert minutes to ms
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

  const cooldownTime = PRESENCE_ROASTER_CONFIG.COOLDOWN_TIME * 60 * 1000; // Convert minutes to ms
  const remaining = cooldownTime - (Date.now() - lastRoasted);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Cleans up expired cooldowns to prevent memory leaks
 */
function cleanupCooldowns(): void {
  const now = Date.now();
  const cooldownTime = PRESENCE_ROASTER_CONFIG.COOLDOWN_TIME * 60 * 1000; // Convert minutes to ms

  for (const [userId, timestamp] of cooldowns.entries()) {
    if (now - timestamp >= cooldownTime) {
      cooldowns.delete(userId);
    }
  }
}

/**
 * Checks if a game is supported in the PRESENCE_ROASTER_CONFIG
 * @param gameName Game to check
 * @returns Whether the game is supported for roasting
 */
function isGameSupported(gameName: string): boolean {
  const normalizedGame = gameName.toLowerCase();

  // Check if any of the supported games match the current game
  return Object.keys(PRESENCE_ROASTER_CONFIG.GAMES).some((gameKey) => {
    return normalizedGame.includes(gameKey.toLowerCase());
  });
}

/**
 * Creates a game-specific context for roasting
 * @param username Username to roast
 * @param gameName Game being played
 * @returns Context string for the AI
 */
function createRoastContext(username: string, gameName: string): string {
  const normalizedGame = gameName.toLowerCase();

  // Create a context string based on the game and player
  let context = `${username} is playing ${gameName}. Create a funny, sarcastic one-sentence roast about them.`;

  // Find the matching game in the config
  const matchedGameKey = Object.keys(PRESENCE_ROASTER_CONFIG.GAMES).find((gameKey) =>
    normalizedGame.includes(gameKey.toLowerCase())
  );

  // Add context from config if we have a match
  if (matchedGameKey) {
    // Use type assertion to safely access the GAMES object with a dynamic key
    const gameConfig =
      PRESENCE_ROASTER_CONFIG.GAMES[matchedGameKey as keyof typeof PRESENCE_ROASTER_CONFIG.GAMES];
    context += ` ${gameConfig.CONTEXT}`;
  }

  return context;
}

/**
 * Gets a default roast if AI fails
 * @param gameName The game name
 * @returns A default roast message
 */
function getDefaultRoast(gameName: string): string {
  const normalizedGame = gameName.toLowerCase();

  // Find the matching game in the config
  const matchedGameKey = Object.keys(PRESENCE_ROASTER_CONFIG.GAMES).find((gameKey) =>
    normalizedGame.includes(gameKey.toLowerCase())
  );

  if (matchedGameKey) {
    // Use type assertion to safely access the GAMES object with a dynamic key
    const gameConfig =
      PRESENCE_ROASTER_CONFIG.GAMES[matchedGameKey as keyof typeof PRESENCE_ROASTER_CONFIG.GAMES];
    const roasts = gameConfig.ROASTS;
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  // This should never happen since we check isGameSupported first
  return 'Not even worth roasting.';
}

/**
 * Gets game-specific context and generates a roast using roastAI
 * @param gameName Game name to get roasts for
 * @param username Username to roast
 * @returns Promise with a roast phrase for the game
 */
async function getGameRoast(gameName: string, username: string): Promise<string> {
  // Create context for the AI using the game and player information
  const context = createRoastContext(username, gameName);

  try {
    // Get a dynamic roast from the AI service
    return await getReliableRoast(context);
  } catch (error) {
    logger.error(
      `Error getting AI roast: ${error instanceof Error ? error.message : String(error)}`
    );

    // Fallback to default roasts if AI fails
    return getDefaultRoast(gameName);
  }
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
    if (!PRESENCE_ROASTER_CONFIG.ENABLED) return;

    // Clean up cooldowns periodically (1% chance on each event to avoid doing it too often)
    if (Math.random() < 0.01) {
      cleanupCooldowns();
    }

    const member = newPresence.member;
    if (!member) return;

    // Skip bots
    if (member.user.bot) return;

    // Get the guild ID
    const guild = newPresence.guild;
    if (!guild) return; // Skip if no guild (shouldn't happen but TypeScript needs this check)

    const guildId = guild.id;

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

    // Skip if the game is not in our supported list
    if (!isGameSupported(gameName)) {
      logger.debug(`Game "${gameName}" not in supported list, skipping roast`);
      return;
    }

    // Check if user is in cooldown
    if (isInCooldown(userId)) {
      logger.debug(`User ${username} is in cooldown for ${getRemainingCooldown(userId)} seconds`);
      return;
    }

    // Random chance to roast (configurable)
    if (Math.random() > PRESENCE_ROASTER_CONFIG.ROAST_CHANCE) {
      return;
    }

    // Get a roast message for the game using AI
    const roastMessage = await getGameRoast(gameName, username);

    // Get the active channel for this guild
    try {
      // Get the active channel ID from guild configuration
      const activeChannelId = await getActiveChannel(guildId);

      // Skip if no active channel is configured
      if (!activeChannelId) {
        logger.debug(`No active channel configured for guild ${guildId}, skipping game roast`);
        return;
      }

      // Get the channel
      const channel = await client.channels.fetch(activeChannelId);

      if (!channel || !(channel instanceof TextChannel)) {
        logger.warn(`Invalid active channel for guild ${guildId}: ${activeChannelId}`);
        return;
      }

      // Send the roast message
      logger.info(`Roasting ${username} for playing ${gameName} in guild ${guildId}`);
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
