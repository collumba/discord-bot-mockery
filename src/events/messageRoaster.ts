import { Events, Message } from 'discord.js';
import logger from '../utils/logger';
import { MESSAGE_ROASTER_CONFIG } from '../config/botConfig';
import { getReliableRoast } from '../services/roastAI';

// Store recent roasts to prevent spamming the same user
const userCooldowns = new Map<string, number>();
const COOLDOWN_TIME = MESSAGE_ROASTER_CONFIG.COOLDOWN_TIME; // 5 seconds in milliseconds
const ROAST_CHANCE = MESSAGE_ROASTER_CONFIG.ROAST_CHANCE; // 100% chance to roast for each trigger

// Types of roasts available
type RoastType = 'LONG_MESSAGE' | 'EMOJI_SPAM' | 'ALL_CAPS' | 'KEYBOARD_SMASH';

/**
 * Gets a roast using AI
 * @param roastType Type of roast
 * @param username Username to mention in the roast
 * @returns Promise with a roast message or null if generation failed
 */
async function getRoast(roastType: RoastType, username: string): Promise<string | null> {
  try {
    // Get context for this roast type from config
    const context = `${username} ${MESSAGE_ROASTER_CONFIG.ROAST_CONTEXTS[roastType]}`;

    // Get a dynamic roast from the AI service
    return await getReliableRoast(context);
  } catch (error) {
    logger.error(
      `Error getting AI roast: ${error instanceof Error ? error.message : String(error)}`
    );
    // Return null to indicate failure - the command will be canceled
    return null;
  }
}

/**
 * Counts the number of emojis in a string
 * This is a simple implementation that might not catch all emoji types
 */
function countEmojis(text: string): number {
  // Basic emoji regex - might not catch all complex emoji variations
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

/**
 * Checks if a message is a keyboard smash
 */
function isKeyboardSmash(text: string): boolean {
  // Check for repeated characters (like "kkkkkkk" or "aaaaaaaa")
  if (/(.)\1{5,}/i.test(text)) return true;

  // Check for random character sequences without spaces
  if (/[a-zA-Z]{10,}/.test(text.replace(/\s/g, '')) && !/\s/.test(text)) return true;

  return false;
}

/**
 * Process a message and decide whether to roast the author
 */
async function processMessage(message: Message): Promise<void> {
  try {
    // Security check
    if (!message || !message.author || !message.content) {
      logger.debug('Skipping message in processMessage due to missing properties');
      return;
    }

    logger.debug(
      `[processMessage] Processing message: ${message.id} from ${message.author.username}`
    );

    const { content, author, channelId } = message;

    // Don't process if user is in cooldown
    const lastRoast = userCooldowns.get(author.id);
    if (lastRoast && Date.now() - lastRoast < COOLDOWN_TIME) {
      logger.debug(`User ${author.username} is in cooldown. Skipping.`);
      return;
    }

    // Skip if message is empty
    if (!content.trim()) {
      logger.debug('Message content is empty. Skipping.');
      return;
    }

    let roastType: RoastType | null = null;

    // Check for long message
    if (content.length > 200) {
      roastType = 'LONG_MESSAGE';
      logger.debug(`Message is long (${content.length} chars). Selected roast type: LONG_MESSAGE`);
    }
    // Check for emoji spam
    else if (countEmojis(content) > 5) {
      roastType = 'EMOJI_SPAM';
      logger.debug(`Message has emoji spam. Selected roast type: EMOJI_SPAM`);
    }
    // Check for ALL CAPS message (if message is at least 5 chars)
    else if (content.length > 5 && content === content.toUpperCase() && /[A-Z]/.test(content)) {
      roastType = 'ALL_CAPS';
      logger.debug(`Message is all caps. Selected roast type: ALL_CAPS`);
    }
    // Check for keyboard smash
    else if (isKeyboardSmash(content)) {
      roastType = 'KEYBOARD_SMASH';
      logger.debug(`Message is keyboard smash. Selected roast type: KEYBOARD_SMASH`);
    } else {
      logger.debug('No roast type matched. Skipping.');
    }

    // If we have a roast type and we pass the random chance check
    if (roastType && Math.random() < ROAST_CHANCE) {
      logger.debug(`Preparing to roast with type: ${roastType}`);

      try {
        // Get a roast using AI
        const roast = await getRoast(roastType, author.username);

        // If AI failed to generate a roast, cancel the command
        if (!roast) {
          logger.debug(`AI failed to generate a roast. Command canceled.`);
          return;
        }

        logger.debug(`Selected roast: "${roast}"`);

        // Apply cooldown
        userCooldowns.set(author.id, Date.now());

        // Send the roast as a reply
        logger.debug(`Sending roast to ${author.username}`);
        message
          .reply(roast)
          .then(() => {
            logger.debug(`Successfully sent roast to ${author.username}`);
          })
          .catch((error) => {
            logger.error(
              `Failed to send roast message: ${error instanceof Error ? error : new Error(String(error))}`
            );
          });
      } catch (error) {
        logger.error(
          `Error getting or sending roast: ${error instanceof Error ? error : new Error(String(error))}`
        );
      }

      // Cleanup old cooldowns occasionally
      if (Math.random() < 0.1) {
        cleanupCooldowns();
      }
    } else if (roastType) {
      logger.debug(
        `Had roast type ${roastType} but failed chance check (${ROAST_CHANCE * 100}% chance)`
      );
    }
  } catch (error) {
    logger.error(
      `Error in processMessage: ${error instanceof Error ? error : new Error(String(error))}`
    );
  }
}

/**
 * Cleans up expired cooldowns to prevent memory leaks
 */
function cleanupCooldowns(): void {
  const now = Date.now();
  for (const [userId, timestamp] of userCooldowns.entries()) {
    if (now - timestamp >= COOLDOWN_TIME) {
      userCooldowns.delete(userId);
    }
  }
}

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message) {
  try {
    // Log the raw message for debugging
    logger.debug(
      `[MessageRoaster] Raw message received: ${typeof message}, constructor: ${message?.constructor?.name}`
    );

    // Security check - verifies each property individually for better debugging
    if (!message) {
      logger.warn('Message object is undefined or null');
      return;
    }

    // Check if author exists
    if (!message.author) {
      logger.warn(
        `Message has no author property: ${JSON.stringify({
          id: message.id,
          content: message.content?.substring(0, 30),
          hasAuthor: !!message.author,
        })}`
      );
      return;
    }

    // Log all parameters for debugging
    logger.debug(
      `Message roaster event triggered: ${JSON.stringify({
        messageId: message.id,
        authorId: message.author.id,
        authorUsername: message.author.username,
        isBot: message.author.bot,
        channelId: message.channelId,
        guildId: message.guildId,
        contentPreview: message.content?.substring(0, 20),
      })}`
    );

    // Ignore bot messages
    if (message.author.bot) {
      logger.debug(`Ignored bot message from: ${message.author.username}`);
      return;
    }

    // Ignore DMs, only respond in guild text channels
    if (!message.guild) {
      logger.debug('Ignored DM message');
      return;
    }

    logger.debug(
      `Processing message: "${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}"`
    );

    // Process the message for potential roasting
    await processMessage(message);
  } catch (error) {
    logger.error(
      'Error in message roaster:',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
