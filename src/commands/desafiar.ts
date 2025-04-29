import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';

export default {
  data: new SlashCommandBuilder()
    .setName('desafiar')
    .setDescription('Desafia um usuário aleatório para um duelo!')
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuário para desafiar').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user');

    if (!user) {
      return interaction.reply({ content: 'Não encontrei esse usuário.', ephemeral: true });
    }

    const desafios = [
      `@${user.username}, você foi desafiado para uma batalha de memes! Quem perde vira o tiozão do grupo.`,
      `@${user.username}, aceitas um X1 de argumentos ruins?`,
      `@${user.username}, hora de provar quem é o maior noob do servidor.`,
      `@${user.username}, seu 1v1 foi requisitado pela ${BOT_CONFIG.NAME}. Boa sorte, vai precisar.`,
      `@${user.username}, duelo de quem faz mais vergonha em público!`,
    ];

    const desafio = desafios[Math.floor(Math.random() * desafios.length)];

    await interaction.reply(desafio);
  },
};
