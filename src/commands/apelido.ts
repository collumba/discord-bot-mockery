import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';

export default {
  data: new SlashCommandBuilder()
    .setName('apelido')
    .setDescription('Sugere um apelido engraçado para alguém.')
    .addUserOption((option) =>
      option.setName('user').setDescription('Usuário para apelidar').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: 'Você não tem permissão para usar este comando.',
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser('user');
    if (!user) {
      return interaction.reply({ content: 'Não encontrei esse usuário.', ephemeral: true });
    }

    // Incrementa no ranking real
    incrementUser(user.id);

    const apelidos = [
      'LagLord',
      'BugMaster',
      'Noobzera',
      'Crashador',
      'Feedador Oficial',
      'Rei do Respawn',
    ];

    const apelido = apelidos[Math.floor(Math.random() * apelidos.length)];

    await interaction.reply(`@${user.username} agora é conhecido como **${apelido}**!`);
  },
};
