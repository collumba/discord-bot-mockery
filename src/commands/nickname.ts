import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { checkAndAwardAchievements } from '../services/achievementsService';
import { t } from '../services/i18nService';

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
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(t('cooldown.wait', { command: 'nickname' }))
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

    incrementUser(user.id, interaction.guildId!, interaction.user.id, 'nickname');
    registerCooldown(interaction.user.id, 'nickname', 15);

    const nicknames = t('commands.nickname.nicknames');

    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];

    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(t('commands.nickname.title'))
      .setDescription(t('commands.nickname.success', { username: user.username, nickname }))
      .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

    await interaction.reply({ embeds: [embed] });

    // Process achievements
    try {
      await checkAndAwardAchievements(interaction.user.id, interaction.guildId!, 'nicknamer');
    } catch (error) {
      console.error('Error processing nickname achievements:', error);
    }
  },
};
