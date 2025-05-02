import { EmbedBuilder, ColorResolvable } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import { t } from './i18nService';

/**
 * Service for creating standardized embeds across the application
 */
class EmbedsService {
  /**
   * Creates a response embed with consistent styling
   *
   * @param title The title for the embed
   * @param description The description for the embed
   * @param icon Optional icon to prepend to the title
   * @param color Optional color for the embed
   * @returns The created embed
   */
  createResponseEmbed(
    title: string,
    description: string,
    icon?: string,
    color?: ColorResolvable
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(color || BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(icon ? `${icon} ${title}` : title)
      .setDescription(description)
      .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });
  }

  /**
   * Creates an error embed
   *
   * @param message The error message
   * @returns The created embed
   */
  createErrorEmbed(message: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('errors.title') || 'Error',
      message,
      BOT_CONFIG.ICONS.ERROR,
      BOT_CONFIG.COLORS.ERROR
    );
  }

  /**
   * Creates a success embed
   *
   * @param message The success message
   * @returns The created embed
   */
  createSuccessEmbed(message: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('success.title') || 'Success',
      message,
      BOT_CONFIG.ICONS.SUCCESS,
      BOT_CONFIG.COLORS.SUCCESS
    );
  }

  /**
   * Creates a warning embed
   *
   * @param message The warning message
   * @returns The created embed
   */
  createWarningEmbed(message: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('warning.title') || 'Warning',
      message,
      BOT_CONFIG.ICONS.COOLDOWN,
      BOT_CONFIG.COLORS.WARNING
    );
  }

  /**
   * Creates a cooldown embed
   *
   * @param command The command name
   * @param seconds Remaining cooldown in seconds
   * @returns The created embed
   */
  createCooldownEmbed(command: string, seconds: number): EmbedBuilder {
    return this.createWarningEmbed(t('cooldown.wait', { seconds, command }));
  }

  /**
   * Creates an achievement embed
   *
   * @param achievementKey The achievement key
   * @returns The created embed
   */
  createAchievementEmbed(achievementKey: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('achievements.unlocked.title'),
      t('achievements.unlocked.description', {
        achievement: t(`achievements.${achievementKey}`),
      }),
      undefined,
      BOT_CONFIG.COLORS.SUCCESS
    );
  }

  /**
   * Creates a ranking embed
   *
   * @param description The ranking description
   * @returns The created embed
   */
  createRankingEmbed(description: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('commands.ranking.embed.title'),
      description,
      BOT_CONFIG.ICONS.RANKING
    );
  }

  /**
   * Creates a mock message embed
   *
   * @param message The mock message
   * @returns The created embed
   */
  createMockEmbed(message: string): EmbedBuilder {
    return this.createResponseEmbed(t('commands.mock.title'), message, BOT_CONFIG.ICONS.MOCK);
  }

  /**
   * Creates a nickname embed
   *
   * @param nickname The nickname
   * @param username The username
   * @returns The created embed
   */
  createNicknameEmbed(nickname: string, username: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('commands.nickname.title'),
      t('commands.nickname.success', { username, nickname }),
      BOT_CONFIG.ICONS.NICKNAME
    );
  }

  /**
   * Creates a humiliation embed
   *
   * @param message The humiliation message
   * @returns The created embed
   */
  createHumiliateEmbed(message: string): EmbedBuilder {
    return this.createResponseEmbed(
      t('commands.humiliate.title'),
      message,
      BOT_CONFIG.ICONS.HUMILIATE
    );
  }
}

// Export singleton instance
export const embedsService = new EmbedsService();
export default embedsService;
