import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

export default {
  data: new SlashCommandBuilder()
    .setName('humilhar')
    .setDescription('Escolhe alguém aleatório para zoar.'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: t('errors.permission_denied'),
        ephemeral: true,
      });
    }

    if (isInCooldown(interaction.user.id, 'humilhar')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'humilhar');
      const embed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: 'humilhar',
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
    registerCooldown(interaction.user.id, 'humilhar', 300); // Cooldown de 5 minutos (300 segundos)

    // Get the humiliation phrases from the translation file
    const humilhacoesArray = t('commands.humilhar.phrases').split('.,');

    // Select a random phrase and replace placeholders
    const fraseBase = humilhacoesArray[Math.floor(Math.random() * humilhacoesArray.length)];
    const frase = fraseBase.replace(/{username}/g, `@${randomMember.user.username}`);

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${BOT_CONFIG.ICONS.HUMILHAR} ${t('commands.humilhar.title')}`)
      .setDescription(frase)
      .setFooter({ text: t('footer', { botName: BOT_CONFIG.NAME }) });

    await interaction.reply({ embeds: [embed] });
  },
};
