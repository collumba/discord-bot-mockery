import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

// Simulador de ranking (em memória)
const fakeRanking = [
  { username: 'Player1', vezes: 12 },
  { username: 'Player2', vezes: 9 },
  { username: 'Player3', vezes: 7 },
  { username: 'Player4', vezes: 5 },
  { username: 'Player5', vezes: 3 }
];

export default {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Mostra quem foi mais zoado pela Soberaninha.'),
  
  async execute(interaction: CommandInteraction) {
    let msg = '**🏆 Ranking dos Mais Zoados:**\n\n';
    fakeRanking.forEach((player, index) => {
      msg += `#${index + 1} - ${player.username} (${player.vezes} zoações)\n`;
    });

    await interaction.reply(msg);
  }
};
