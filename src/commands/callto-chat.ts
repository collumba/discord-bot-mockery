import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from 'discord.js';
import {
  startCallTo,
  isInCooldown,
  registerCooldown,
  getRemainingCooldown,
} from '../services/callToService';
import { canExecute } from '../utils/canExecuteCommand';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('callto-chat')
    .setDescription(t('commands.callto.chat.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    // Verificar permissões
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: t('errors.permission_denied'),
        ephemeral: true,
      });
    }

    // Verificar se o canal é um canal de texto em um servidor
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: t('errors.server_only'),
        ephemeral: true,
      });
    }

    // Verificar cooldown
    if (isInCooldown(interaction.user.id, 'chat')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'chat');

      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: t('commands.callto.chat.name'),
          })}`
        )
        .setFooter({
          text: t('footer', { botName: BOT_CONFIG.NAME }),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Registrar cooldown
    registerCooldown(interaction.user.id, 'chat');

    // Enviar mensagem
    const success = await startCallTo(interaction.channel, 'chat');

    if (success) {
      // Responder ao comando de forma efêmera
      return interaction.reply({
        content: t('commands.callto.chat.success'),
        ephemeral: true,
      });
    } else {
      // Informar erro
      return interaction.reply({
        content: t('commands.callto.chat.error'),
        ephemeral: true,
      });
    }
  },
};
