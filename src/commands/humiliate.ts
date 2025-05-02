import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import BOT_CONFIG, { COMMANDS_CONFIG } from '../config/botConfig';
import { checkAndAwardAchievements } from '../services/achievementsService';
import { t } from '../services/i18nService';
import { getReliableRoast } from '../services/roastAI';

export default {
  data: new SlashCommandBuilder()
    .setName('humiliate')
    .setDescription(t('commands.humiliate.builder.description')),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: t('errors.permission_denied'),
        ephemeral: true,
      });
    }

    if (isInCooldown(interaction.user.id, 'humiliate')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'humiliate');
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: 'humiliate',
          })}`
        )
        .setFooter({
          text: t('footer', { botName: BOT_CONFIG.NAME }),
        });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!interaction.guild) {
      return interaction.reply({
        content: t('errors.server_only'),
        ephemeral: true,
      });
    }

    const members = await interaction.guild.members.fetch();
    // Filter out bots and the bot itself
    const filteredMembers = members.filter(
      (m) => !m.user.bot && m.user.id !== interaction.client.user?.id
    );

    if (filteredMembers.size === 0) {
      return interaction.reply({
        content: t('errors.no_members_to_insult'),
        ephemeral: true,
      });
    }

    const randomMember = filteredMembers.random();

    if (!randomMember) {
      return interaction.reply({
        content: t('errors.no_valid_members'),
        ephemeral: true,
      });
    }

    // Defer the reply since AI generation may take time
    await interaction.deferReply();

    try {
      // Generate an AI-powered insult
      const context = COMMANDS_CONFIG.HUMILIATE.CONTEXT.replace('@USER', randomMember.displayName);
      const insult = await getReliableRoast(context);

      // If AI generation failed, cancel the command
      if (!insult) {
        return interaction.editReply({
          content: t('errors.execution'),
        });
      }

      // Record the successful humiliation
      incrementUser(randomMember.user.id, interaction.guildId!);
      registerCooldown(interaction.user.id, 'humiliate', 300); // 5 minute cooldown (300 seconds)

      // Create and send the embed with the AI-generated insult
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.DEFAULT)
        .setTitle(`${BOT_CONFIG.ICONS.HUMILIATE} ${t('commands.humiliate.title')}`)
        .setDescription(insult.replace('@USER', `<@${randomMember.user.id}>`))
        .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

      await interaction.editReply({ embeds: [embed] });

      // Process achievements for target user
      try {
        await checkAndAwardAchievements(randomMember.user.id, interaction.guildId!, 'mocked');
      } catch (error) {
        console.error('Error processing humiliate achievements:', error);
      }
    } catch (error) {
      console.error('Error in humiliate command:', error);
      return interaction.editReply({
        content: t('errors.execution'),
      });
    }
  },
};
