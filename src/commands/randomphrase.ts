import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';
import { getReliableRoast } from '../services/roastAI';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';

export default {
  data: new SlashCommandBuilder()
    .setName('randomphrase')
    .setDescription(t('commands.randomphrase.builder.description', { botName: BOT_CONFIG.NAME })),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check for cooldown
    if (isInCooldown(interaction.user.id, 'randomphrase')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'randomphrase');
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: 'randomphrase',
          })}`
        )
        .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Defer the reply since AI generation may take time
    await interaction.deferReply();

    try {
      // Generate an AI-powered random phrase
      const context = BOT_CONFIG.COMMANDS.RANDOMPHRASE.CONTEXT;
      const phrase = await getReliableRoast(context);

      // If AI generation failed, cancel the command
      if (!phrase) {
        return interaction.editReply({
          content: t('errors.execution'),
        });
      }

      // Register cooldown
      registerCooldown(
        interaction.user.id,
        'randomphrase',
        BOT_CONFIG.COMMANDS.RANDOMPHRASE.COOLDOWN_TIME / 1000
      );

      // Create embed with the AI-generated phrase
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.DEFAULT)
        .setDescription(phrase.replace(/{botName}/g, BOT_CONFIG.NAME))
        .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

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
