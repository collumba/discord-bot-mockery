import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  UserMention,
} from 'discord.js';
import { incrementUser } from '../services/rankingService';

export default {
  data: new SlashCommandBuilder()
    .setName('zoar')
    .setDescription('Zoa um membro do servidor')
    .addUserOption((option) =>
      option.setName('alvo').setDescription('A pessoa que será zoada').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Pega o usuário alvo da zoação
    const alvo = interaction.options.getUser('alvo');

    if (!alvo) {
      return await interaction.reply({
        content: 'Você precisa mencionar alguém para zoar!',
        ephemeral: true,
      });
    }

    // Incrementa no ranking real
    incrementUser(alvo.id);

    // Lista de frases zoeiras (adicione mais conforme necessário)
    const frasesZoeiras = [
      `${alvo} tá jogando tão mal que até os bots do tutorial têm pena.`,
      `Todo mundo erra, mas ${alvo} eleva isso a uma arte.`,
      `${alvo} é o tipo de pessoa que morre pro tutorial.`,
      `${alvo} tá tão ruim hoje que seria kickado de um jogo single-player.`,
      `${alvo} tem tanto talento que até o auto-aim desiste.`,
      `Os NPCs entram em modo fácil quando veem ${alvo} chegando.`,
      `${alvo} é aquele que compra skin pra morrer mais bonito.`,
      `Dizem que ${alvo} já zerou o LoL. Morreu de todas as formas possíveis.`,
      `As estatísticas de ${alvo} são tão ruins que a Steam sugere jogar Candy Crush.`,
      `${alvo} é tão azarado que até bug acontece só com ele.`,
    ];

    // Seleciona uma frase aleatória
    const fraseEscolhida = frasesZoeiras[Math.floor(Math.random() * frasesZoeiras.length)];

    // Cria o embed com estilo da Soberaninha
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle('👑 Zoação Realizada!')
      .setDescription(fraseEscolhida)
      .setFooter({ text: 'by Soberaninha 👑' })
      .setTimestamp();

    // Responde com o embed
    await interaction.reply({ embeds: [embed] });
  },
};
