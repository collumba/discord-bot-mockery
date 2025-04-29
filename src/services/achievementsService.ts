import Achievement, { IAchievement } from '../models/Achievement';
import { incrementUser, getCountForUser, getUniqueTargetsCount } from './rankingService';
import logger from '../utils/logger';
import { t } from './i18nService';

/**
 * Types of events that can grant achievements
 */
export type AchievementEventType = 'mocked' | 'mocker' | 'nicknamer';

/**
 * Achievement definition
 */
interface AchievementDefinition {
  id: string;
  translationKey: string;
  check: (value: number) => boolean;
}

/**
 * List of available achievements
 */
const ACHIEVEMENTS: AchievementDefinition[] = [
  // Being mocked achievements
  {
    id: 'mocked_10',
    translationKey: 'achievements.mocked_10',
    check: (count: number) => count >= 10,
  },
  {
    id: 'mocked_50',
    translationKey: 'achievements.mocked_50',
    check: (count: number) => count >= 50,
  },
  {
    id: 'mocked_100',
    translationKey: 'achievements.mocked_100',
    check: (count: number) => count >= 100,
  },
  // Mocking others achievements
  {
    id: 'mocker_30',
    translationKey: 'achievements.mocker_30',
    check: (count: number) => count >= 30,
  },
  // Nickname achievements
  {
    id: 'nicknamer_20',
    translationKey: 'achievements.nicknamer_20',
    check: (count: number) => count >= 20,
  },
];

/**
 * Process an achievement event and award any earned achievements
 * @param userId User ID
 * @param serverId Server ID
 * @param eventType Type of event (mocked, mocker, etc.)
 * @param value Current value for the event type (e.g., number of times mocked)
 * @returns Array of achievement IDs that were newly awarded, or null if error
 */
export async function processAchievementEvent(
  userId: string,
  serverId: string,
  eventType: AchievementEventType,
  value: number
): Promise<string[] | null> {
  try {
    // Get existing user achievements
    const userAchievements = await getOrCreateUserAchievements(userId, serverId);
    const existingAchievements = userAchievements.achievements || [];

    // Filter achievements by event type
    const eligibleAchievements = ACHIEVEMENTS.filter((a) => a.id.startsWith(eventType));

    // Find achievements to award (those that check passes and not already earned)
    const newAchievements = eligibleAchievements.filter(
      (a) => a.check(value) && !existingAchievements.includes(a.id)
    );

    // If there are new achievements, update the document
    if (newAchievements.length > 0) {
      const newAchievementIds = newAchievements.map((a) => a.id);
      userAchievements.achievements = [...existingAchievements, ...newAchievementIds].sort();

      await userAchievements.save();
      return newAchievementIds;
    }

    return [];
  } catch (error) {
    logger.error(
      `Error processing achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Fetches or creates a user's achievements document
 * @param userId User ID
 * @param serverId Server ID
 * @returns Achievements document
 */
export async function getOrCreateUserAchievements(
  userId: string,
  serverId: string
): Promise<IAchievement> {
  try {
    // Try to find existing document
    let userAchievements = await Achievement.findOne({ userId, serverId });

    // If it doesn't exist, create a new one
    if (!userAchievements) {
      userAchievements = new Achievement({
        userId,
        serverId,
        achievements: [],
      });
      await userAchievements.save();
      logger.info(`Created new achievements document for user ${userId} in server ${serverId}`);
    }

    return userAchievements;
  } catch (error) {
    logger.error(
      `Error getting or creating achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Checks for new achievements and awards them if earned
 * @deprecated Use processAchievementEvent instead
 * @param userId User ID
 * @param serverId Server ID
 * @param eventType Type of event (mocked, mocker, etc.)
 * @returns Array of achievement IDs that were newly awarded, or null if error
 */
export async function checkAndAwardAchievements(
  userId: string,
  serverId: string,
  eventType: 'mocked' | 'mocker' | 'nicknamer'
): Promise<string[] | null> {
  try {
    // Get current value based on event type
    let value = 0;
    if (eventType === 'mocked') {
      value = await getCountForUser(userId, serverId);
    } else if (eventType === 'mocker' || eventType === 'nicknamer') {
      const actionType = eventType === 'mocker' ? 'mock' : 'nickname';
      value = await getUniqueTargetsCount(userId, serverId, actionType);
    }

    return processAchievementEvent(userId, serverId, eventType, value);
  } catch (error) {
    logger.error(
      `Error checking achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Gets all achievements for a user
 * @param userId User ID
 * @param serverId Server ID
 * @returns Array of achievement IDs or empty array
 */
export async function getUserAchievements(userId: string, serverId: string): Promise<string[]> {
  try {
    const userAchievements = await getOrCreateUserAchievements(userId, serverId);
    return userAchievements.achievements;
  } catch (error) {
    logger.error(
      `Error getting achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

/**
 * Converts an achievement ID to its translated title
 * @param achievementId Achievement ID
 * @returns Translated achievement title
 */
export function getAchievementTitle(achievementId: string): string {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

  if (!achievement) {
    logger.warn(`Unknown achievement ID: ${achievementId}`);
    return achievementId;
  }

  return t(achievement.translationKey);
}

/**
 * Interface for achievement progress
 */
export interface AchievementProgress {
  id: string;
  title: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

/**
 * Get user progress on all achievements
 * @param userId User ID
 * @param serverId Server ID
 * Obter o progresso do usuário em todos os achievements
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @returns Array com o progresso de cada achievement
 */
export async function getUserAchievementProgress(
  userId: string,
  serverId: string
): Promise<AchievementProgress[]> {
  try {
    const userAchievements = await getUserAchievements(userId, serverId);
    const progress: AchievementProgress[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const unlocked = userAchievements.includes(achievement.id);
      const achievementProgress: AchievementProgress = {
        id: achievement.id,
        title: getAchievementTitle(achievement.id),
        unlocked,
      };

      // Adiciona informações de progresso para achievements específicos
      if (
        achievement.id === 'mocked_10' ||
        achievement.id === 'mocked_50' ||
        achievement.id === 'mocked_100'
      ) {
        const count = await getCountForUser(userId, serverId);
        let total = 10;

        if (achievement.id === 'mocked_50') total = 50;
        if (achievement.id === 'mocked_100') total = 100;

        achievementProgress.progress = Math.min(count, total);
        achievementProgress.total = total;
      } else if (achievement.id === 'mocker_30') {
        const count = await getUniqueTargetsCount(userId, serverId);
        achievementProgress.progress = Math.min(count, 30);
        achievementProgress.total = 30;
      } else if (achievement.id === 'nicknamer_20') {
        const count = await getUniqueTargetsCount(userId, serverId, 'nickname');
        achievementProgress.progress = Math.min(count, 20);
        achievementProgress.total = 20;
      }

      progress.push(achievementProgress);
    }

    return progress;
  } catch (error) {
    logger.error(
      `Error getting achievement progress for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

export default {
  checkAndAwardAchievements,
  getUserAchievements,
  getAchievementTitle,
  getUserAchievementProgress,
};
