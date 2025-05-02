import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from 'discord.js';
import {
  isInCooldown,
  registerCooldown,
  getRemainingCooldown,
  sendCallToAI,
} from '../services/callToAIService';
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

    // Defer the reply since AI generation may take time
    await interaction.deferReply({ ephemeral: true });

    // Send AI message
    const success = await sendCallToAI(interaction.channel, 'chat');

    // Register cooldown only if the message was sent successfully
    if (success) {
      registerCooldown(interaction.user.id, 'chat');

      // Respond to the command in an ephemeral manner
      return interaction.editReply({
        content: t('commands.callto.chat.success'),
      });
    } else {
      // Inform the error
      return interaction.editReply({
        content: t('commands.callto.chat.error'),
      });
    }
  },
};
