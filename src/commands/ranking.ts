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
      // Verifica se é um servidor
      if (!interaction.guild || !interaction.guildId) {
        return await interaction.reply({
          content: t('errors.server_only'),
          ephemeral: true,
        });
      }

      // Busca o ranking - usando a função de compatibilidade que retorna [userId, count]
      const ranking = await getTopRankingLegacy(interaction.guildId, 10);

      // Se não tiver dados no ranking
      if (!ranking || ranking.length === 0) {
        return await interaction.reply({
          content: t('commands.ranking.empty'),
          ephemeral: true,
        });
      }

      // Formata o ranking como texto para o embed
      let rankingText = '';

      try {
        // Para cada entrada do ranking
        for (let i = 0; i < ranking.length; i++) {
          const [userId, count] = ranking[i];

          try {
            // Tenta buscar o usuário no Discord
            const user = await interaction.client.users.fetch(userId);

            // Adiciona a linha formatada
            rankingText += `**${i + 1}.** ${user.username}: **${count}** ${
              count === 1
                ? t('commands.ranking.action_name')
                : t('commands.ranking.action_name_plural')
            }\n`;
          } catch (error) {
            // Se não conseguir buscar o usuário
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

      // Mensagens motivacionais para o primeiro colocado
      const mensagensParaPrimeiro = t('commands.ranking.motivational_messages').split('.,');

      // Adiciona uma mensagem especial para o primeiro colocado
      if (ranking.length > 0) {
        const mensagemAleatoria =
          mensagensParaPrimeiro[Math.floor(Math.random() * mensagensParaPrimeiro.length)];
        rankingText += `\n${mensagemAleatoria}`;
      }

      // Cria o embed com estilo do bot
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.DEFAULT)
        .setTitle(t('commands.ranking.embed.title'))
        .setDescription(rankingText)
        .setFooter({
          text: t('commands.ranking.embed.footer', { botName: BOT_CONFIG.NAME }),
        })
        .setTimestamp();

      // Responde com o embed
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao executar comando ranking:', error);
      await interaction.reply({
        content: t('commands.ranking.error.execute'),
        ephemeral: true,
      });
    }
  },
};
