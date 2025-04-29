import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';

export default {
  data: new SlashCommandBuilder()
    .setName('humilhar')
    .setDescription('Escolhe alguém aleatório para zoar.'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: 'Você não tem permissão para usar este comando.',
        ephemeral: true,
      });
    }

    if (isInCooldown(interaction.user.id, 'humilhar')) {
      const remainingTime = getRemainingCooldown(interaction.user.id, 'humilhar');
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('⏳ Espera um pouco!')
        .setDescription(
          `Você precisa esperar mais ${remainingTime} segundos antes de humilhar novamente! 😈`
        )
        .setFooter({ text: `by ${BOT_CONFIG.NAME} 👑` });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!interaction.guild) {
      return interaction.reply({
        content: 'Esse comando só funciona em servidores.',
        ephemeral: true,
      });
    }

    const members = await interaction.guild.members.fetch();
    const filteredMembers = members.filter((m) => !m.user.bot);

    if (filteredMembers.size === 0) {
      return interaction.reply({ content: 'Ninguém para humilhar no momento.', ephemeral: true });
    }

    const randomMember = filteredMembers.random();

    if (!randomMember) {
      return interaction.reply({
        content: 'Não foi possível encontrar um membro válido.',
        ephemeral: true,
      });
    }

    incrementUser(randomMember.user.id, interaction.guildId!);
    registerCooldown(interaction.user.id, 'humilhar', 300); // Cooldown de 5 minutos (300 segundos)

    const humilhacoes = [
      `@${randomMember.user.username} é a prova viva que respiração é automática.`,
      `@${randomMember.user.username} confunde skill de cura com skill de dano.`,
      `@${randomMember.user.username} já tomou DC no tutorial.`,
      `@${randomMember.user.username} é considerado NPC pelo próprio time.`,
      `@${randomMember.user.username} é tão ruim que até os bots evitam.`,
    ];

    const frase = humilhacoes[Math.floor(Math.random() * humilhacoes.length)];

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('💀 Humilhação Pública!')
      .setDescription(frase)
      .setFooter({ text: `by ${BOT_CONFIG.NAME} 👑` });

    await interaction.reply({ embeds: [embed] });
  },
};
