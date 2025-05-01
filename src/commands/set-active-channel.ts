import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
  ChannelSelectMenuBuilder,
  ActionRowBuilder,
} from 'discord.js';
import { setActiveChannel, getActiveChannel } from '../services/guildConfigService';
import { t } from '../services/i18nService';

// Nome do comando fixo em vez de usar a tradução diretamente
const COMMAND_NAME = 'set-active-channel';

export default {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription(t('commands.set_active_channel.description'))
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription(t('commands.set_active_channel.options.channel'))
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    // Only admins can use this command (enforced by setDefaultMemberPermissions above)
    if (!interaction.guildId) {
      await interaction.reply({
        content: t('commands.set_active_channel.errors.server_only'),
        ephemeral: true,
      });
      return;
    }

    // Get the selected channel from the options
    const selectedChannel = interaction.options.getChannel('channel') as TextChannel;
    if (!selectedChannel || selectedChannel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: t('commands.set_active_channel.errors.text_channel_only'),
        ephemeral: true,
      });
      return;
    }

    const channelId = selectedChannel.id;

    try {
      // Check if a channel is already configured
      const currentChannelId = await getActiveChannel(interaction.guildId);
      let responseMessage = '';

      if (currentChannelId) {
        // Channel was previously configured
        if (currentChannelId === channelId) {
          responseMessage = t('commands.set_active_channel.success.already_set');
        } else {
          responseMessage = t('commands.set_active_channel.success.updated', {
            previousChannel: `<#${currentChannelId}>`,
          });
        }
      } else {
        // No channel was previously configured
        responseMessage = t('commands.set_active_channel.success.set');
      }

      // Update the channel configuration
      await setActiveChannel(interaction.guildId, channelId);

      await interaction.reply({
        content: `${responseMessage} ${t('commands.set_active_channel.success.channel_set', {
          channel: `<#${channelId}>`,
        })}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Error setting active channel:', error);
      await interaction.reply({
        content: t('commands.set_active_channel.errors.set_error'),
        ephemeral: true,
      });
    }
  },
};
