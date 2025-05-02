import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import BOT_CONFIG, { COMMANDS_CONFIG } from '../config/botConfig';
import { t } from '../services/i18nService';
import CommandHandler from '../utils/commandHandler';
import AchievementHandler from '../utils/achievementHandler';

export default {
  data: new SlashCommandBuilder()
    .setName('mock')
    .setDescription(t('commands.mock.builder.description'))
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription(t('commands.mock.builder.options.target'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check permissions
    const permissionCheck = CommandHandler.checkPermissions(interaction);
    if (!permissionCheck.success) {
      return interaction.reply(permissionCheck.response);
    }

    // Check cooldown
    const cooldownCheck = CommandHandler.checkCooldown(interaction, 'mock');
    if (!cooldownCheck.success) {
      return interaction.reply(cooldownCheck.response);
    }

    // Validate target user
    const userCheck = CommandHandler.validateTargetUser(interaction, 'target');
    if (!userCheck.success) {
      return interaction.reply(userCheck.response);
    }

    const target = userCheck.user;

    // Defer the reply since AI generation may take time
    await interaction.deferReply();

    try {
      // Generate an AI-powered mock message
      const generation = await CommandHandler.generateAiContent('MOCK', {
        '@USER': target.username,
      });

      // If AI generation failed, cancel the command
      if (!generation.success) {
        return interaction.editReply({
          content: t('errors.execution'),
        });
      }

      // Register cooldown and update rankings only if AI generation succeeds
      CommandHandler.applyCooldown(
        interaction.user.id,
        'mock',
        COMMANDS_CONFIG.MOCK.COOLDOWN_TIME / 1000
      );
      await incrementUser(target.id, interaction.guildId!, interaction.user.id, 'mock');

      // Create embed with the AI-generated mock message
      const embed = CommandHandler.embedsService.createResponseEmbed(
        t('commands.mock.title'),
        generation.content.replace('@USER', `@${target.username}`),
        BOT_CONFIG.ICONS.MOCK
      );

      // Send the reply
      await interaction.editReply({ embeds: [embed] });

      // Process achievements after command execution
      await AchievementHandler.processCommandAchievements(
        interaction.user,
        interaction.guildId!,
        'mocker',
        target,
        'mocked'
      );
    } catch (error) {
      console.error('Error in mock command:', error);
      return interaction.editReply({
        content: t('errors.execution'),
      });
    }
  },
};
