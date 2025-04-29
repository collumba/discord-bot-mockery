import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('randomphrase')
    .setDescription(t('commands.randomphrase.builder.description', { botName: BOT_CONFIG.NAME })),

  async execute(interaction: ChatInputCommandInteraction) {
    // Get phrases and split into array since they're joined with .,
    const phrasesArray = t('commands.randomphrase.phrases').split('.,');

    // Choose a random phrase
    const basePhrase = phrasesArray[Math.floor(Math.random() * phrasesArray.length)];

    // Replace placeholders
    const phrase = basePhrase.replace(/{botName}/g, BOT_CONFIG.NAME);

    await interaction.reply(phrase);
  },
};
