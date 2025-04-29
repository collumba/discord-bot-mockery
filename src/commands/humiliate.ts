import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { checkAndAwardAchievements } from '../services/achievementsService';
import { t } from '../services/i18nService';

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
    const filteredMembers = members.filter((m) => !m.user.bot);

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

    incrementUser(randomMember.user.id, interaction.guildId!);
    registerCooldown(interaction.user.id, 'humiliate', 300); // 5 minute cooldown (300 seconds)

    // Get the humiliation phrases from the translation file
    const humiliationPhrases = t('commands.humiliate.phrases').split('.,');

    // Select a random phrase and replace placeholders
    const basePhrase = humiliationPhrases[Math.floor(Math.random() * humiliationPhrases.length)];
    const phrase = basePhrase.replace(/{username}/g, `@${randomMember.user.username}`);

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${BOT_CONFIG.ICONS.HUMILIATE} ${t('commands.humiliate.title')}`)
      .setDescription(phrase)
      .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

    await interaction.reply({ embeds: [embed] });

    // Process achievements for target user
    try {
      await checkAndAwardAchievements(randomMember.user.id, interaction.guildId!, 'mocked');
    } catch (error) {
      console.error('Error processing humiliate achievements:', error);
    }
  },
};
