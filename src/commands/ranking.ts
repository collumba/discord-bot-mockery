import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getTopRankingLegacy } from '../services/rankingService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription(t('commands.ranking.builder.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Check if it's a server
      if (!interaction.guild || !interaction.guildId) {
        return await interaction.reply({
          content: t('errors.server_only'),
          ephemeral: true,
        });
      }

      // Search the ranking - using the compatibility function that returns [userId, count]
      const ranking = await getTopRankingLegacy(interaction.guildId, 10);

      // If there is no data in the ranking
      if (!ranking || ranking.length === 0) {
        return await interaction.reply({
          content: t('commands.ranking.empty'),
          ephemeral: true,
        });
      }

      // Format the ranking as text for the embed
      let rankingText = '';

      try {
        // For each entry in the ranking
        for (let i = 0; i < ranking.length; i++) {
          const [userId, count] = ranking[i];

          try {
            // Try to fetch the user in Discord
            const user = await interaction.client.users.fetch(userId);

            // Add the formatted line
            rankingText += `**${i + 1}.** ${user.username}: **${count}** ${
              count === 1
                ? t('commands.ranking.action_name')
                : t('commands.ranking.action_name_plural')
            }\n`;
          } catch (error) {
            // If it's not possible to fetch the user
            rankingText += `**${i + 1}.** ${t('commands.ranking.unknown_user')}: **${count}** ${
              count === 1
                ? t('commands.ranking.action_name')
                : t('commands.ranking.action_name_plural')
            }\n`;
            console.error(t('commands.ranking.error.process', { error }));
          }
        }
      } catch (error) {
        console.error(error);
      }

      // Motivational messages for the first place
      const motivationalMessagesForFirst = t('commands.ranking.motivational_messages').split('.,');

      // Add a special message for the first place
      if (ranking.length > 0) {
        const randomMessage =
          motivationalMessagesForFirst[
            Math.floor(Math.random() * motivationalMessagesForFirst.length)
          ];
        rankingText += `\n${randomMessage}`;
      }

      // Create the embed with bot style
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.DEFAULT)
        .setTitle(`${BOT_CONFIG.ICONS.RANKING} ${t('commands.ranking.embed.title')}`)
        .setDescription(rankingText)
        .setFooter({
          text: t('commands.ranking.embed.footer', { botName: BOT_CONFIG.NAME }),
        })
        .setTimestamp();

      // Respond with the embed
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing ranking command:', error);
      await interaction.reply({
        content: t('commands.ranking.error.execute'),
        ephemeral: true,
      });
    }
  },
};
