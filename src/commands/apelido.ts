import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';
export default {
  data: new SlashCommandBuilder()
    .setName('apelido')
    .setDescription(t('commands.apelido.builder.description'))
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(t('commands.apelido.builder.options.user'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: t('errors.permission_denied'),
        ephemeral: true,
      });
    }

    if (isInCooldown(interaction.user.id, 'apelido')) {
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(t('cooldown.wait', { command: 'apelido' }))
        .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    if (!user) {
      return interaction.reply({ content: t('errors.user_not_found'), ephemeral: true });
    }

    incrementUser(user.id, interaction.guildId!);
    registerCooldown(interaction.user.id, 'apelido', 15);

    const apelidos = t('commands.apelido.nicknames');

    const apelido = apelidos[Math.floor(Math.random() * apelidos.length)];

    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(t('commands.apelido.title'))
      .setDescription(t('commands.apelido.success', { username: user.username, apelido }))
      .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

    await interaction.reply({ embeds: [embed] });
  },
};
