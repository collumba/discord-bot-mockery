import logger from '../utils/logger';

/**
 * Stores user cooldowns by command
 * Structure: Map<userId, Map<commandName, expirationTimestamp>>
 */
const cooldowns = new Map<string, Map<string, number>>();

/**
 * Checks if a user is on cooldown for a specific command
 * @param userId User ID
 * @param commandName Command name
 * @returns True if the user is on cooldown, False otherwise
 */
export function isInCooldown(userId: string, commandName: string): boolean {
  // Checks if the user has any cooldowns registered
  if (!cooldowns.has(userId)) {
    return false;
  }

  const userCooldowns = cooldowns.get(userId);

  // Checks if the user has cooldown for this specific command
  if (!userCooldowns?.has(commandName)) {
    return false;
  }

  // Gets the expiration timestamp
  const expirationTime = userCooldowns.get(commandName) as number;

  // Checks if the cooldown is still active
  const currentTime = Date.now();

  if (currentTime < expirationTime) {
    return true;
  } else {
    // If the cooldown has expired, remove it from the list
    userCooldowns.delete(commandName);
    return false;
  }
}

/**
 * Registers a cooldown for a user and command
 * @param userId User ID
 * @param commandName Command name
 * @param seconds Cooldown duration in seconds
 */
export function registerCooldown(userId: string, commandName: string, seconds: number): void {
  // Calculates the expiration timestamp
  const expirationTime = Date.now() + seconds * 1000;

  // Registers the cooldown for the user/command
  if (!cooldowns.has(userId)) {
    cooldowns.set(userId, new Map<string, number>());
  }

  const userCooldowns = cooldowns.get(userId) as Map<string, number>;
  userCooldowns.set(commandName, expirationTime);

  logger.debug(`Cooldown registrado para ${userId} no comando ${commandName} por ${seconds}s`);
}

/**
 * Returns the remaining time in seconds for a specific cooldown
 * @param userId User ID
 * @param commandName Command name
 * @returns Remaining time in seconds or 0 if not on cooldown
 */
export function getRemainingCooldown(userId: string, commandName: string): number {
  if (!cooldowns.has(userId)) {
    return 0;
  }

  const userCooldowns = cooldowns.get(userId);

  if (!userCooldowns?.has(commandName)) {
    return 0;
  }

  const expirationTime = userCooldowns.get(commandName) as number;
  const currentTime = Date.now();

  if (currentTime < expirationTime) {
    // Returns the remaining time in seconds, rounded up
    return Math.ceil((expirationTime - currentTime) / 1000);
  }

  return 0;
}

/**
 * Cleans up expired cooldowns periodically to avoid excessive memory usage
 */
function cleanupExpiredCooldowns(): void {
  const currentTime = Date.now();

  cooldowns.forEach((userCooldowns, userId) => {
    // Filters and removes expired cooldowns
    let hasRemovedEntries = false;

    userCooldowns.forEach((expirationTime, command) => {
      if (currentTime > expirationTime) {
        userCooldowns.delete(command);
        hasRemovedEntries = true;
      }
    });

    // If the user has no more cooldowns, remove the user from the Map
    if (userCooldowns.size === 0 || hasRemovedEntries) {
      if (userCooldowns.size === 0) {
        cooldowns.delete(userId);
      }
      logger.debug(`Cooldowns cleaned for user ${userId}`);
    }
  });
}

// Executes cleanup every 5 minutes
setInterval(cleanupExpiredCooldowns, 5 * 60 * 1000);

export default {
  isInCooldown,
  registerCooldown,
  getRemainingCooldown,
};
