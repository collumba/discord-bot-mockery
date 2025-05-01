import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { isInActiveChannel } from '../services/guildConfigService';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('example-command')
    .setDescription('Example command showing active channel integration'),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check if the interaction is in the active channel before proceeding
    if (!(await isInActiveChannel(interaction))) {
      // Optionally reply with an ephemeral message indicating the correct channel
      // This is optional - you could also silently ignore the command
      return;
    }

    // Command logic goes here
    await interaction.reply(t('commands.set_active_channel.examples.command_success'));
  },
};
