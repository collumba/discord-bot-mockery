import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser, getCountForUser, getUniqueTargetsCount } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { checkAndAwardAchievements } from '../services/achievementsService';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('mock')
    .setDescription(t('commands.mock.builder.description'))
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription(t('commands.mock.builder.options.target'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check permissions
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: t('errors.permission_denied'),
        ephemeral: true,
      });
    }

    // Check cooldown
    if (isInCooldown(interaction.user.id, 'mock')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'mock');
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: 'mock',
          })}`
        )
        .setFooter({
          text: t('footer', { botName: BOT_CONFIG.NAME }),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Get target user
    const target = interaction.options.getUser('target');

    if (!target) {
      return interaction.reply({
        content: t('errors.user_not_found'),
        ephemeral: true,
      });
    }

    // Prevent targeting self
    if (target.id === interaction.user.id) {
      return interaction.reply({
        content: t('commands.mock.error.self_target'),
        ephemeral: true,
      });
    }

    // Prevent targeting bots
    if (target.bot) {
      return interaction.reply({
        content: t('errors.no_valid_members'),
        ephemeral: true,
      });
    }

    // Register cooldown
    registerCooldown(interaction.user.id, 'mock', 30); // 30 second cooldown

    // Update rankings
    await incrementUser(target.id, interaction.guildId!, interaction.user.id, 'mock');

    // Get mockery phrases from translations
    const mockeryArray = t('commands.mock.phrases').split('.,');

    // Random phrase selection
    const basePhrase = mockeryArray[Math.floor(Math.random() * mockeryArray.length)];
    const phrase = basePhrase.replace(/{target}/g, `@${target.username}`);

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(`${BOT_CONFIG.ICONS.MOCK} ${t('commands.mock.title')}`)
      .setDescription(phrase)
      .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

    // Send the reply
    await interaction.reply({ embeds: [embed] });

    // Process achievements after command execution
    try {
      // Check for achievements
      const targetAchievements = await checkAndAwardAchievements(
        target.id,
        interaction.guildId!,
        'mocked'
      );

      const authorAchievements = await checkAndAwardAchievements(
        interaction.user.id,
        interaction.guildId!,
        'mocker'
      );

      // Send achievement notifications if earned
      if (targetAchievements && targetAchievements.length > 0) {
        try {
          // Create achievement embed
          const achievementEmbed = new EmbedBuilder()
            .setColor(BOT_CONFIG.COLORS.SUCCESS)
            .setTitle(t('achievements.unlocked.title'))
            .setDescription(
              t('achievements.unlocked.description', {
                achievement: t(`achievements.${targetAchievements[0]}`),
              })
            )
            .setFooter({
              text: t('footer', { botName: BOT_CONFIG.NAME }),
            });

          // Try to send DM to target
          await target.send({ embeds: [achievementEmbed] }).catch(() => {
            // Fail silently (user might have DMs disabled)
          });
        } catch (error) {
          console.error('Error sending achievement notification:', error);
        }
      }

      // If author earned achievements, notify them
      if (authorAchievements && authorAchievements.length > 0) {
        try {
          // Create achievement embed
          const achievementEmbed = new EmbedBuilder()
            .setColor(BOT_CONFIG.COLORS.SUCCESS)
            .setTitle(t('achievements.unlocked.title'))
            .setDescription(
              t('achievements.unlocked.description', {
                achievement: t(`achievements.${authorAchievements[0]}`),
              })
            )
            .setFooter({
              text: t('footer', { botName: BOT_CONFIG.NAME }),
            });

          // Try to send DM to author
          await interaction.user.send({ embeds: [achievementEmbed] }).catch(() => {
            // Fail silently (user might have DMs disabled)
          });
        } catch (error) {
          console.error('Error sending achievement notification:', error);
        }
      }
    } catch (error) {
      console.error('Error processing achievements:', error);
      // Don't let achievement errors break the command experience
    }
  },
};
