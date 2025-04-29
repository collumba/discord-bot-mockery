import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('desafiar')
    .setDescription(t('commands.desafiar.builder.description'))
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(t('commands.desafiar.builder.options.user'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user');

    if (!user) {
      return interaction.reply({ content: t('errors.user_not_found'), ephemeral: true });
    }

    // Get phrases and split into array since they're joined with .,
    const desafiosArray = t('commands.desafiar.phrases').split('.,');

    // Choose a random phrase
    const desafioBase = desafiosArray[Math.floor(Math.random() * desafiosArray.length)];

    // Replace placeholders
    const desafio = desafioBase
      .replace(/@username/g, `@${user.username}`)
      .replace(/{botName}/g, BOT_CONFIG.NAME);

    await interaction.reply(desafio);
  },
};
