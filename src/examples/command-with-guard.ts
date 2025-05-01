import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { isInActiveChannel } from '../services/guildConfigService';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('example-with-guard')
    .setDescription('Example of a command with direct active channel verification'),

  async execute(interaction: ChatInputCommandInteraction) {
    // Direct implementation of active channel verification in the command
    // Only use this approach if not using the global middleware
    if (!(await isInActiveChannel(interaction))) {
      await interaction.reply({
        content: t('errors.wrong_channel'),
        ephemeral: true,
      });
      return;
    }

    // From here, we know that the command is in the correct channel
    await interaction.reply('This command works because it is being used in the correct channel!');
  },
};
