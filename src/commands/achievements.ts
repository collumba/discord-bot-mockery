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
      // Verifica se é um servidor
      if (!interaction.guild || !interaction.guildId) {
        return await interaction.reply({
          content: t('errors.server_only'),
          ephemeral: true,
        });
      }

      // Pega o usuário alvo (se especificado) ou o próprio usuário
      const targetUser = interaction.options.getUser('user') || interaction.user;

      // Informa que está processando
      await interaction.deferReply();

      // Obtém o progresso dos achievements do usuário
      const achievements = await getUserAchievementProgress(targetUser.id, interaction.guildId);

      // Se não tiver achievements desbloqueados
      if (!achievements.some((a) => a.unlocked)) {
        // Verifica se é o próprio usuário ou outro usuário
        const isOwnAchievements = targetUser.id === interaction.user.id;

        return await interaction.editReply({
          content: isOwnAchievements
            ? t('commands.achievements.no_achievements_self')
            : t('commands.achievements.no_achievements_other', { username: targetUser.username }),
        });
      }

      // Formata o texto dos achievements
      let achievementsText = '';

      // Primeiro mostra os achievements desbloqueados
      const unlockedAchievements = achievements.filter((a) => a.unlocked);
      if (unlockedAchievements.length > 0) {
        achievementsText += `## ${t('commands.achievements.unlocked_section')}\n\n`;

        for (const achievement of unlockedAchievements) {
          achievementsText += `🏆 **${achievement.title}**\n`;
        }

        achievementsText += '\n';
      }

      // Depois mostra os achievements pendentes (com progresso)
      const pendingAchievements = achievements
        .filter((a) => !a.unlocked && a.progress !== undefined && a.total !== undefined)
        .sort((a, b) => {
          // Ordenar por porcentagem de conclusão (decrescente)
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

      // Cria o embed
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

      // Responde com o embed
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao executar comando achievements:', error);
      await interaction.editReply({
        content: t('commands.achievements.error'),
      });
    }
  },
};
