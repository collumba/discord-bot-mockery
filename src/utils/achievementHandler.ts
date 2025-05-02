import { User, EmbedBuilder } from 'discord.js';
import { checkAndAwardAchievements } from '../services/achievementsService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

/**
 * Types of tracked achievements
 */
export type AchievementType = 'mocked' | 'mocker' | 'nicknamer';

/**
 * Processes achievements for a user and sends notifications if new achievements are earned
 *
 * @param user The user who may have earned achievements
 * @param guildId The ID of the guild where the achievement was earned
 * @param achievementType The type of achievement to check
 * @param sendNotification Whether to send a DM notification (default true)
 * @returns A promise resolving to the list of earned achievements
 */
export async function processAchievements(
  user: User,
  guildId: string,
  achievementType: AchievementType,
  sendNotification: boolean = true
): Promise<string[]> {
  try {
    // Check and award achievements
    const earnedAchievements = await checkAndAwardAchievements(user.id, guildId, achievementType);

    // Send notifications if any achievements were earned and notifications are enabled
    if (sendNotification && earnedAchievements && earnedAchievements.length > 0) {
      try {
        // Create achievement embed
        const achievementEmbed = new EmbedBuilder()
          .setColor(BOT_CONFIG.COLORS.SUCCESS)
          .setTitle(t('achievements.unlocked.title'))
          .setDescription(
            t('achievements.unlocked.description', {
              achievement: t(`achievements.${earnedAchievements[0]}`),
            })
          )
          .setFooter({
            text: t('footer', { botName: BOT_CONFIG.NAME }),
          });

        // Try to send DM to user (fail silently if not possible)
        await user.send({ embeds: [achievementEmbed] }).catch(() => {
          // User might have DMs disabled
        });
      } catch (error) {
        console.error('Error sending achievement notification:', error);
        // Don't throw errors from notification failures
      }
    }

    return earnedAchievements || [];
  } catch (error) {
    console.error(`Error processing achievements for ${user.tag}:`, error);
    return [];
  }
}

/**
 * Processes achievements for both the command user and target user (if applicable)
 *
 * @param author The user who executed the command
 * @param target The user who was targeted by the command (optional)
 * @param guildId The ID of the guild where the command was executed
 * @param authorType The achievement type to check for the author
 * @param targetType The achievement type to check for the target (if provided)
 */
export async function processCommandAchievements(
  author: User,
  guildId: string,
  authorType: AchievementType,
  target?: User,
  targetType?: AchievementType
): Promise<void> {
  try {
    // Process author achievements
    await processAchievements(author, guildId, authorType);

    // Process target achievements if provided
    if (target && targetType) {
      await processAchievements(target, guildId, targetType);
    }
  } catch (error) {
    console.error('Error processing command achievements:', error);
    // Don't let achievement errors break the command experience
  }
}

export const AchievementHandler = {
  processAchievements,
  processCommandAchievements,
};

export default AchievementHandler;
