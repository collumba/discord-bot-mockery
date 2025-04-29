import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';

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

    // Incrementa o zoado
    incrementUser(randomMember?.user.id || '');

    const humilhacoes = [
      `@${randomMember?.user.username} é a prova viva que respiração é automática.`,
      `@${randomMember?.user.username} confunde skill de cura com skill de dano.`,
      `@${randomMember?.user.username} já tomou DC no tutorial.`,
      `@${randomMember?.user.username} é considerado NPC pelo próprio time.`,
      `@${randomMember?.user.username} é tão ruim que até os bots evitam.`,
    ];

    const frase = humilhacoes[Math.floor(Math.random() * humilhacoes.length)];

    await interaction.reply(frase);
  },
};
