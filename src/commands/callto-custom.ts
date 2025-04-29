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
    .setName('callto-custom')
    .setDescription(t('commands.callto.custom.description'))
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription(t('commands.callto.custom.option_text'))
        .setRequired(true)
        .setMaxLength(300)
    ),

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

    // Obter o texto personalizado
    const customText = interaction.options.getString('text', true);

    // Verificar cooldown
    if (isInCooldown(interaction.user.id, 'custom')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'custom');

      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: t('commands.callto.custom.name'),
          })}`
        )
        .setFooter({
          text: t('footer', { botName: BOT_CONFIG.NAME }),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Registrar cooldown
    registerCooldown(interaction.user.id, 'custom');

    // Enviar mensagem
    const success = await startCallTo(interaction.channel, 'custom', customText);

    if (success) {
      // Responder ao comando de forma efêmera
      return interaction.reply({
        content: t('commands.callto.custom.success'),
        ephemeral: true,
      });
    } else {
      // Informar erro
      return interaction.reply({
        content: t('commands.callto.custom.error'),
        ephemeral: true,
      });
    }
  },
};
