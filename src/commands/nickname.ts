import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { checkAndAwardAchievements } from '../services/achievementsService';
import { t } from '../services/i18nService';
import { getReliableRoast } from '../services/roastAI';

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
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: t('errors.permission_denied'),
        ephemeral: true,
      });
    }

    if (isInCooldown(interaction.user.id, 'nickname')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'nickname');
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: 'nickname',
          })}`
        )
        .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    if (!user) {
      return interaction.reply({ content: t('errors.user_not_found'), ephemeral: true });
    }

    // Prevent selecting the bot itself
    if (user.id === interaction.client.user?.id) {
      return interaction.reply({
        content: t('errors.no_valid_members'),
        ephemeral: true,
      });
    }

    // Prevent targeting self
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: t('commands.nickname.error.self_target'),
        ephemeral: true,
      });
    }

    // Defer the reply since AI generation may take time
    await interaction.deferReply();

    try {
      // Generate an AI-powered nickname
      const context = BOT_CONFIG.COMMANDS.NICKNAME.CONTEXT.replace('@USER', user.username);
      const nickname = await getReliableRoast(context);

      // If AI generation failed, cancel the command
      if (!nickname) {
        return interaction.editReply({
          content: t('errors.execution'),
        });
      }

      // Register cooldown and update rankings
      registerCooldown(
        interaction.user.id,
        'nickname',
        BOT_CONFIG.COMMANDS.NICKNAME.COOLDOWN_TIME / 1000
      );
      incrementUser(user.id, interaction.guildId!, interaction.user.id, 'nickname');

      // Create embed with the AI-generated nickname
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.DEFAULT)
        .setTitle(`${BOT_CONFIG.ICONS.NICKNAME} ${t('commands.nickname.title')}`)
        .setDescription(t('commands.nickname.success', { username: `<@${user.id}>`, nickname }))
        .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

      // Send the reply
      await interaction.editReply({ embeds: [embed] });

      // Process achievements
      try {
        await checkAndAwardAchievements(interaction.user.id, interaction.guildId!, 'nicknamer');
      } catch (error) {
        console.error('Error processing nickname achievements:', error);
      }
    } catch (error) {
      console.error('Error in nickname command:', error);
      return interaction.editReply({
        content: t('errors.execution'),
      });
    }
  },
};
