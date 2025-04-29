import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getTopRanking } from '../services/rankingService';

export default {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra o ranking dos membros mais zoados'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Verifica se é um servidor
      if (!interaction.guild) {
        return await interaction.reply({
          content: 'Este comando só pode ser usado em servidores!',
          ephemeral: true,
        });
      }

      // Busca o ranking
      const ranking = getTopRanking();

      // Se não tiver dados no ranking
      if (!ranking || ranking.length === 0) {
        return await interaction.reply({
          content: 'Ainda não há ninguém no ranking dos zoados!',
          ephemeral: true,
        });
      }

      // Formata o ranking como texto para o embed
      let rankingText = '';

      // Para cada membro no top 10
      for (let i = 0; i < ranking.length && i < 10; i++) {
        try {
          const [userId, count] = ranking[i];

          // Tenta buscar o membro do servidor
          const member = await interaction.guild.members.fetch(userId).catch(() => null);

          // Adiciona na lista formatada
          if (member) {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            rankingText += `${medalha} ${member} - **${count}** zoeiras\n`;
          } else {
            // Usuário não encontrado no servidor
            rankingText += `${i + 1}. Usuário desconhecido - **${count}** zoeiras\n`;
          }
        } catch (error) {
          console.error(`Erro ao processar usuário no ranking: ${error}`);
          continue;
        }
      }

      // Mensagens motivacionais para o primeiro colocado
      const mensagensParaPrimeiro = [
        '🎖️ Parabéns por ser o mais zoado! Que conquista, hein?',
        '🏆 O título de "Mais Zoado" é seu por mérito próprio!',
        '💯 Ser o mais zoado requer talento especial... ou muita falta dele!',
        '🌟 Ninguém consegue ser zoado como você. É um dom!',
        '🔥 O troféu de "Melhor Alvo de Zoações" vai para você!',
      ];

      // Adiciona uma mensagem especial para o primeiro colocado
      if (ranking.length > 0) {
        const mensagemAleatoria =
          mensagensParaPrimeiro[Math.floor(Math.random() * mensagensParaPrimeiro.length)];
        rankingText += `\n${mensagemAleatoria}`;
      }

      // Cria o embed com estilo da Soberaninha
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('🏆 Ranking dos Mais Zoados')
        .setDescription(rankingText)
        .setFooter({ text: 'by Soberaninha 👑' })
        .setTimestamp();

      // Responde com o embed
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao executar comando ranking:', error);
      await interaction.reply({
        content: 'Ocorreu um erro ao buscar o ranking!',
        ephemeral: true,
      });
    }
  },
};
