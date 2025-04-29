import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';

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

    if (isInCooldown(interaction.user.id, 'apelido')) {
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle('⏳ Espera um pouco!')
        .setDescription('Você precisa esperar um pouco antes de sugerir outro apelido! 🎯')
        .setFooter({ text: `by ${BOT_CONFIG.NAME} 👑` });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    if (!user) {
      return interaction.reply({ content: 'Não encontrei esse usuário.', ephemeral: true });
    }

    incrementUser(user.id, interaction.guildId!);
    registerCooldown(interaction.user.id, 'apelido', 15); // Cooldown de 15 segundos

    const apelidos = [
      'LagLord',
      'BugMaster',
      'Noobzera',
      'Crashador',
      'Feedador Oficial',
      'Rei do Respawn',
    ];

    const apelido = apelidos[Math.floor(Math.random() * apelidos.length)];

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('🎯 Novo Apelido Encontrado!')
      .setDescription(`@${user.username} agora é conhecido como **${apelido}**!`)
      .setFooter({ text: `by ${BOT_CONFIG.NAME} 👑` });

    await interaction.reply({ embeds: [embed] });
  },
};
