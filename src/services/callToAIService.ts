import { TextChannel, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger';
import BOT_CONFIG, { CALL_TO_CONFIG } from '../config/botConfig';
import { getReliableRoast } from './roastAI';

// Types of Call to Action
export type CallToType = 'play' | 'chat' | 'event' | 'custom';

// Map to store cooldowns by user ID and type
const cooldowns = new Map<string, number>();

// Get cooldown time from config
const COOLDOWN_TIME = CALL_TO_CONFIG.COMMAND_COOLDOWN_TIME;

/**
 * Checks if a user is in cooldown for a specific call type
 * @param userId User ID to check
 * @param type Call type
 * @returns Whether the user is in cooldown
 */
export function isInCooldown(userId: string, type: CallToType): boolean {
  const key = `${userId}_${type}`;
  const lastUsed = cooldowns.get(key);

  if (!lastUsed) return false;

  return Date.now() - lastUsed < COOLDOWN_TIME;
}

/**
 * Gets the remaining cooldown time in seconds
 * @param userId User ID to check
 * @param type Call type
 * @returns Remaining cooldown time in seconds
 */
export function getRemainingCooldown(userId: string, type: CallToType): number {
  const key = `${userId}_${type}`;
  const lastUsed = cooldowns.get(key);

  if (!lastUsed) return 0;

  const remaining = COOLDOWN_TIME - (Date.now() - lastUsed);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Registers a new cooldown for a user
 * @param userId User ID
 * @param type Call type
 */
export function registerCooldown(userId: string, type: CallToType): void {
  const key = `${userId}_${type}`;
  cooldowns.set(key, Date.now());
}

/**
 * Generates a call-to-action message using the roastAI service
 * @param type Type of call to action
 * @param customText Optional custom text for 'custom' type
 * @returns The generated message or null if generation failed
 */
export async function generateCallToMessage(
  type: CallToType,
  customText?: string
): Promise<string | null> {
  try {
    // Get context for this call type from config
    let context = CALL_TO_CONFIG.CONTEXTS[type];

    // For custom type, append the custom text to the context
    if (type === 'custom' && customText) {
      context += customText;
    }

    // Generate message using roastAI
    return await getReliableRoast(context);
  } catch (error) {
    logger.error(
      `Error generating call-to-action message: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Sends an AI-generated call-to-action message to a channel
 * @param channel The channel to send the message to
 * @param type The type of call-to-action
 * @param customText Optional custom text for 'custom' type
 * @returns Whether the message was sent successfully
 */
export async function sendCallToAI(
  channel: TextChannel,
  type: CallToType,
  customText?: string
): Promise<boolean> {
  try {
    // Check if this type is disabled
    if (CALL_TO_CONFIG.DISABLED_TYPES && CALL_TO_CONFIG.DISABLED_TYPES.includes(type)) {
      logger.warn(`Call-to-action type ${type} is currently disabled`);
      return false;
    }

    // Generate message using roastAI
    const message = await generateCallToMessage(type, customText);

    // If message generation failed, cancel the command
    if (!message) {
      logger.warn(`Failed to generate message for call-to-action of type ${type}, canceling`);
      return false;
    }

    // Create embed with the message
    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(CALL_TO_CONFIG.TITLES[type])
      .setDescription(message)
      .setTimestamp();

    // Send the message
    await channel.send({ embeds: [embed] });
    logger.info(`CallTo message sent to channel ${channel.name} (${channel.id}) with type ${type}`);
    return true;
  } catch (error) {
    logger.error(
      `Error sending call-to-action message: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

/**
 * Cleans up expired cooldowns to prevent memory leaks
 */
export function cleanupCooldowns(): void {
  const now = Date.now();
  for (const [key, timestamp] of cooldowns.entries()) {
    if (now - timestamp >= COOLDOWN_TIME) {
      cooldowns.delete(key);
    }
  }
}
