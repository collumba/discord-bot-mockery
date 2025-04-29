import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('frasealeatoria')
    .setDescription(t('commands.frasealeatoria.builder.description', { botName: BOT_CONFIG.NAME })),

  async execute(interaction: ChatInputCommandInteraction) {
    // Get phrases and split into array since they're joined with .,
    const frasesArray = t('commands.frasealeatoria.phrases').split('.,');

    // Choose a random phrase
    const fraseBase = frasesArray[Math.floor(Math.random() * frasesArray.length)];

    // Replace placeholders
    const frase = fraseBase.replace(/{botName}/g, BOT_CONFIG.NAME);

    await interaction.reply(frase);
  },
};
