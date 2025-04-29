import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getTopRanking } from '../services/rankingService';

export default {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra quem foi mais zoado pela Soberaninha.'),

  async execute(interaction: ChatInputCommandInteraction) {
    const top = getTopRanking();

    if (top.length === 0) {
      return interaction.reply('Ainda não temos zoados suficientes! 🥲');
    }

    let reply = '**🏆 Ranking dos Mais Zoados:**\n\n';
    for (const [userId, vezes] of top) {
      reply += `<@${userId}> — ${vezes} zoações\n`;
    }

    await interaction.reply(reply);
  },
};
