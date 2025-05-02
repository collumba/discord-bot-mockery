import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';
import CommandHandler from '../utils/commandHandler';

export default {
  data: new SlashCommandBuilder()
    .setName('randomphrase')
    .setDescription(t('commands.randomphrase.builder.description', { botName: BOT_CONFIG.NAME })),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check for cooldown
    const cooldownCheck = CommandHandler.checkCooldown(interaction, 'randomphrase');
    if (!cooldownCheck.success) {
      return interaction.reply(cooldownCheck.response);
    }

    // Defer the reply since AI generation may take time
    await interaction.deferReply();

    try {
      // Generate an AI-powered random phrase
      const generation = await CommandHandler.generateAiContent('RANDOMPHRASE');

      // If AI generation failed, cancel the command
      if (!generation.success) {
        return interaction.editReply({
          content: t('errors.execution'),
        });
      }

      // Register cooldown
      CommandHandler.applyCooldown(
        interaction.user.id,
        'randomphrase',
        BOT_CONFIG.COMMANDS.RANDOMPHRASE.COOLDOWN_TIME / 1000
      );

      // Create embed with the AI-generated phrase and no title
      const embed = CommandHandler.embedsService.createResponseEmbed(
        '', // No title needed for randomphrase
        generation.content.replace(/{botName}/g, BOT_CONFIG.NAME)
      );

      // Send the reply
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in randomphrase command:', error);
      return interaction.editReply({
        content: t('errors.execution'),
      });
    }
  },
};
