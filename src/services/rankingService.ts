// src/services/rankingService.ts
import Ranking, { IRanking } from '../models/Ranking';
import logger from '../utils/logger';

// Interface for the ranking format
interface RankingItem {
  userId: string;
  count: number;
}

/**
 * Increments the mockery count for a user in a specific server
 * @param userId ID of the user
 * @param serverId ID of the server
 * @param targetId Optional target ID (to track unique targets)
 * @param actionType Type of action (default: 'mock')
 */
export async function incrementUser(
  userId: string,
  serverId: string,
  targetId?: string,
  actionType: 'mock' | 'nickname' = 'mock'
): Promise<void> {
  try {
    // Try to find existing record
    const existingRecord = await Ranking.findOne({ userId, serverId });

    if (existingRecord) {
      // If it exists, increment the counter
      existingRecord.count += 1;

      // If we have a targetId, add to unique targets
      if (targetId) {
        // Initialize arrays if they don't exist
        if (!existingRecord.uniqueTargets) existingRecord.uniqueTargets = [];
        if (!existingRecord.uniqueNicknames) existingRecord.uniqueNicknames = [];

        // Add targetId to corresponding array if not already there
        if (actionType === 'mock' && !existingRecord.uniqueTargets.includes(targetId)) {
          existingRecord.uniqueTargets.push(targetId);
        } else if (
          actionType === 'nickname' &&
          !existingRecord.uniqueNicknames.includes(targetId)
        ) {
          existingRecord.uniqueNicknames.push(targetId);
        }
      }

      await existingRecord.save();
    } else {
      // If it doesn't exist, create a new one
      const newRecord: any = {
        userId,
        serverId,
        count: 1,
      };

      // Add targetId to arrays if provided
      if (targetId) {
        if (actionType === 'mock') {
          newRecord.uniqueTargets = [targetId];
        } else if (actionType === 'nickname') {
          newRecord.uniqueNicknames = [targetId];
        }
      }

      await Ranking.create(newRecord);
    }
  } catch (error) {
    logger.error(`Error incrementing count for user ${userId}:`, error as Error);
    // Ensure the error doesn't break the experience
  }
}

/**
 * Returns the ranking of most mocked users in a specific server
 * @param serverId ID of the server
 * @param limit Maximum number of results (default: 5)
 * @returns Array of objects with userId and count
 */
export async function getTopRanking(serverId: string, limit = 5): Promise<RankingItem[]> {
  try {
    // Find records sorted by count (descending)
    const rankings = await Ranking.find({ serverId })
      .sort({ count: -1 })
      .limit(limit)
      .select('userId count')
      .lean();

    // Transform to the format expected by commands
    return rankings.map((doc: any) => ({
      userId: doc.userId,
      count: doc.count,
    }));
  } catch (error) {
    logger.error(`Error fetching ranking for server ${serverId}:`, error as Error);
    // Return empty array in case of error
    return [];
  }
}

/**
 * Returns the ranking of most mocked users in a specific server (legacy format)
 * @param serverId ID of the server
 * @param limit Maximum number of results (default: 5)
 * @returns Array of [userId, count] tuples
 */
export async function getTopRankingLegacy(
  serverId: string,
  limit = 5
): Promise<[string, number][]> {
  try {
    const rankings = await getTopRanking(serverId, limit);
    return rankings.map((item) => [item.userId, item.count]);
  } catch (error) {
    logger.error(`Error fetching legacy ranking for server ${serverId}:`, error as Error);
    return [];
  }
}

/**
 * Gets the number of times a user has been mocked
 * @param userId ID of the user
 * @param serverId ID of the server
 * @returns Number of times the user was mocked
 */
export async function getCountForUser(userId: string, serverId: string): Promise<number> {
  try {
    const record = await Ranking.findOne({ userId, serverId }).select('count').lean();
    return record?.count || 0;
  } catch (error) {
    logger.error(`Error fetching count for user ${userId}:`, error as Error);
    return 0;
  }
}

/**
 * Gets the number of unique targets a user has mocked or nicknamed
 * @param userId ID of the user who performed the action
 * @param serverId ID of the server
 * @param actionType Type of action (mock or nickname)
 * @returns Number of unique targets
 */
export async function getUniqueTargetsCount(
  userId: string,
  serverId: string,
  actionType: 'mock' | 'nickname' = 'mock'
): Promise<number> {
  try {
    const field = actionType === 'mock' ? 'uniqueTargets' : 'uniqueNicknames';
    const record = await Ranking.findOne({ userId, serverId }).select(field).lean();

    if (!record || !record[field]) {
      return 0;
    }

    return record[field].length;
  } catch (error) {
    logger.error(`Error fetching unique targets for user ${userId}:`, error as Error);
    return 0;
  }
}

export default {
  incrementUser,
  getTopRanking,
  getTopRankingLegacy,
  getCountForUser,
  getUniqueTargetsCount,
};
