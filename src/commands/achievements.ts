import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getUserAchievementProgress, AchievementProgress } from '../services/achievementsService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription(t('commands.achievements.builder.description'))
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(t('commands.achievements.builder.options.user'))
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Check if it's a server
      if (!interaction.guild || !interaction.guildId) {
        return await interaction.reply({
          content: t('errors.server_only'),
          ephemeral: true,
        });
      }

      // Get the target user (if specified) or the user itself
      const targetUser = interaction.options.getUser('user') || interaction.user;

      // Inform that it's processing
      await interaction.deferReply();

      // Get the achievement progress of the user
      const achievements = await getUserAchievementProgress(targetUser.id, interaction.guildId);

      // If there are no unlocked achievements
      if (!achievements.some((a) => a.unlocked)) {
        // Check if it's the user itself or another user
        const isOwnAchievements = targetUser.id === interaction.user.id;

        return await interaction.editReply({
          content: isOwnAchievements
            ? t('commands.achievements.no_achievements_self')
            : t('commands.achievements.no_achievements_other', { username: targetUser.username }),
        });
      }

      // Format the achievements text
      let achievementsText = '';

      // First show the unlocked achievements
      const unlockedAchievements = achievements.filter((a) => a.unlocked);
      if (unlockedAchievements.length > 0) {
        achievementsText += `## ${t('commands.achievements.unlocked_section')}\n\n`;

        for (const achievement of unlockedAchievements) {
          achievementsText += `🏆 **${achievement.title}**\n`;
        }

        achievementsText += '\n';
      }

      // Then show the pending achievements (with progress)
      const pendingAchievements = achievements
        .filter((a) => !a.unlocked && a.progress !== undefined && a.total !== undefined)
        .sort((a, b) => {
          // Sort by completion percentage (descending)
          const aPercentage = (a.progress! / a.total!) * 100;
          const bPercentage = (b.progress! / b.total!) * 100;
          return bPercentage - aPercentage;
        });

      if (pendingAchievements.length > 0) {
        achievementsText += `## ${t('commands.achievements.pending_section')}\n\n`;

        for (const achievement of pendingAchievements) {
          const percentage = Math.floor((achievement.progress! / achievement.total!) * 100);
          achievementsText += `⏳ **${achievement.title}** - ${achievement.progress}/${achievement.total} (${percentage}%)\n`;
        }
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.DEFAULT)
        .setTitle(
          targetUser.id === interaction.user.id
            ? t('commands.achievements.embed.title_self')
            : t('commands.achievements.embed.title_other', { username: targetUser.username })
        )
        .setDescription(achievementsText)
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({
          text: t('footer', { botName: BOT_CONFIG.NAME }),
        })
        .setTimestamp();

      // Respond with the embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing achievements command:', error);
      await interaction.editReply({
        content: t('commands.achievements.error'),
      });
    }
  },
};
