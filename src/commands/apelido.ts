import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { incrementUser } from '../services/rankingService';
import { canExecute } from '../utils/canExecuteCommand';

export default {
  data: new SlashCommandBuilder()
    .setName('apelido')
    .setDescription('Sugere um apelido zoeiro para alguém')
    .addUserOption((option) =>
      option.setName('alvo').setDescription('Pessoa que receberá um apelido').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!canExecute(interaction)) {
      return interaction.reply({
        content: 'Você não tem permissão para usar este comando.',
        ephemeral: true,
      });
    }

    // Verifica se o comando está sendo usado em um servidor
    if (!interaction.guildId) {
      return await interaction.reply({
        content: 'Este comando só pode ser usado em servidores!',
        ephemeral: true,
      });
    }

    // Pega o usuário alvo
    const alvo = interaction.options.getUser('alvo');

    if (!alvo) {
      return await interaction.reply({
        content: 'Você precisa mencionar alguém para dar um apelido!',
        ephemeral: true,
      });
    }

    // Incrementa no ranking com o MongoDB
    await incrementUser(alvo.id, interaction.guildId);

    // Lista de prefixos e sufixos para criar apelidos
    const prefixos = [
      'Mestre',
      'Rei',
      'Destruidor',
      'Campeão',
      'Lenda',
      'Noob',
      'Mago',
      'Caçador',
      'Imperador',
      'Guerreiro',
      'Titan',
      'Plebeu',
      'Capitão',
      'Ultra',
      'Mega',
      'Super',
      'Hiper',
      'Dr.',
      'Sir',
      'Mito',
      'Rookie',
    ];

    const sufixos = [
      'das Sombras',
      'do Lag',
      'dos Bugs',
      'das Derrotas',
      'do Mato',
      'do Bronze',
      'do Atraso',
      'da Ruindade',
      'da Derrota',
      'do DC',
      'do Choro',
      'das Falhas',
      'dos Tombos',
      'do AFK',
      'do Respawn',
      'da Morte Boba',
      'do Tutorial',
      'dos Memes',
      'da Trollagem',
      'dos Feeders',
      'das Quests Fáceis',
    ];

    // Gera um apelido aleatório combinando prefixo e sufixo
    const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
    const sufixo = sufixos[Math.floor(Math.random() * sufixos.length)];
    const apelido = `${prefixo} ${sufixo}`;

    // Cria mensagens personalizadas
    const frases = [
      `Acabei de pensar no apelido perfeito para ${alvo}: **${apelido}**`,
      `Analisando o histórico de jogo de ${alvo}, o apelido ideal seria: **${apelido}**`,
      `Se eu fosse rebatizar ${alvo}, seria como: **${apelido}**`,
      `O título que melhor descreve ${alvo} é: **${apelido}**`,
      `Depois de analisar suas habilidades, ${alvo} merece ser chamado de: **${apelido}**`,
    ];

    const fraseEscolhida = frases[Math.floor(Math.random() * frases.length)];

    // Cria o embed com estilo da Soberaninha
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('🎯 Novo Apelido Encontrado!')
      .setDescription(fraseEscolhida)
      .setFooter({ text: 'by Soberaninha 👑' })
      .setTimestamp();

    // Responde com o embed
    await interaction.reply({ embeds: [embed] });
  },
};
