import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMemberManager,
} from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';

export default {
  data: new SlashCommandBuilder()
    .setName('humilhar')
    .setDescription('Escolhe uma pessoa aleatória para humilhar'),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: 'Você não tem permissão para usar este comando.',
        ephemeral: true,
      });
    }

    if (!interaction.guild || !interaction.guildId) {
      return interaction.reply({
        content: 'Este comando só pode ser usado em servidores!',
        ephemeral: true,
      });
    }

    try {
      const members = await interaction.guild.members.fetch();
      const humanMembers = members.filter((member) => !member.user.bot);

      if (humanMembers.size === 0) {
        return interaction.reply({
          content: 'Não encontrei nenhum membro para humilhar!',
          ephemeral: true,
        });
      }

      const randomIndex = Math.floor(Math.random() * humanMembers.size);
      const randomMember = [...humanMembers.values()][randomIndex];

      await incrementUser(randomMember?.user.id || '', interaction.guildId);

      const frasesHumilhacao = [
        `${randomMember} acabou de ganhar o prêmio de "Maior Desastre Gamer de 2023" 🏆`,
        `Uma vez vi ${randomMember} tentar jogar xadrez contra si mesmo e ainda assim perdeu.`,
        `${randomMember} é tão ruim que até os NPCs sentem pena e se deixam perder.`,
        `${randomMember} deve guardar seus troféus de "participação" em uma estante bem grande.`,
        `Sabia que ${randomMember} é conhecido pela tática "morrer e dar informação pro time inimigo"?`,
        `${randomMember} é o tipo que cai em pranks de tutorial 💀`,
        `Quando ${randomMember} entra no voice chat, até os hackers saem do servidor.`,
        `${randomMember} consegue morrer no modo espectador.`,
        `A build de ${randomMember} é tão ruim que os desenvolvedores lançaram um patch só pra ele.`,
        `${randomMember} é a prova viva de que algumas pessoas nasceram só pra ser o exemplo negativo.`,
      ];

      const fraseEscolhida = frasesHumilhacao[Math.floor(Math.random() * frasesHumilhacao.length)];

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('💀 Humilhação Pública!')
        .setDescription(fraseEscolhida)
        .setFooter({ text: 'by Soberaninha 👑' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro ao executar comando humilhar:', error);
      await interaction.reply({
        content: 'Ocorreu um erro ao tentar humilhar alguém!',
        ephemeral: true,
      });
    }
  },
};
