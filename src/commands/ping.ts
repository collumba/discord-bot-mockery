import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription(t('commands.ping.description')),

  async execute(interaction: CommandInteraction) {
    await interaction.reply(t('commands.ping.response'));
  },
};
