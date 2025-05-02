import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';
import CommandHandler from '../utils/commandHandler';
import AchievementHandler from '../utils/achievementHandler';

export default {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription(t('commands.nickname.builder.description'))
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(t('commands.nickname.builder.options.user'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Check permissions
    const permissionCheck = CommandHandler.checkPermissions(interaction);
    if (!permissionCheck.success) {
      return interaction.reply(permissionCheck.response);
    }

    // Check cooldown
    const cooldownCheck = CommandHandler.checkCooldown(interaction, 'nickname');
    if (!cooldownCheck.success) {
      return interaction.reply(cooldownCheck.response);
    }

    // Validate target user
    const userCheck = CommandHandler.validateTargetUser(interaction, 'user');
    if (!userCheck.success) {
      return interaction.reply(userCheck.response);
    }

    const user = userCheck.user;

    // Defer the reply since AI generation may take time
    await interaction.deferReply();

    try {
      // Generate an AI-powered nickname
      const generation = await CommandHandler.generateAiContent('NICKNAME', {
        '@USER': user.username,
      });

      // If AI generation failed, cancel the command
      if (!generation.success) {
        return interaction.editReply({
          content: t('errors.execution'),
        });
      }

      // Register cooldown and update rankings
      CommandHandler.applyCooldown(
        interaction.user.id,
        'nickname',
        BOT_CONFIG.COMMANDS.NICKNAME.COOLDOWN_TIME / 1000
      );
      incrementUser(user.id, interaction.guildId!, interaction.user.id, 'nickname');

      // Create embed with the AI-generated nickname
      const embed = CommandHandler.embedsService.createResponseEmbed(
        t('commands.nickname.title'),
        t('commands.nickname.success', { username: `<@${user.id}>`, nickname: generation.content }),
        BOT_CONFIG.ICONS.NICKNAME
      );

      // Send the reply
      await interaction.editReply({ embeds: [embed] });

      // Process achievements
      await AchievementHandler.processAchievements(
        interaction.user,
        interaction.guildId!,
        'nicknamer'
      );
    } catch (error) {
      console.error('Error in nickname command:', error);
      return interaction.editReply({
        content: t('errors.execution'),
      });
    }
  },
};
