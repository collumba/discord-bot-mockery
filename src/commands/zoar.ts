import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  UserMention,
} from 'discord.js';
import { incrementUser } from '../services/rankingService';
import cooldownService from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';

// Configuração do cooldown para o comando zoar (em segundos)
const COOLDOWN_DURATION = 20;

export default {
  data: new SlashCommandBuilder()
    .setName('zoar')
    .setDescription('Zoa um membro do servidor')
    .addUserOption((option) =>
      option.setName('alvo').setDescription('A pessoa que será zoada').setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const commandName = interaction.commandName;

    // Verifica se o usuário está em cooldown
    if (cooldownService.isInCooldown(userId, commandName)) {
      const remainingTime = cooldownService.getRemainingCooldown(userId, commandName);

      // Cria o embed de aviso de cooldown
      const cooldownEmbed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(`${BOT_CONFIG.ICONS.COOLDOWN} Espera um pouco!`)
        .setDescription(
          `Você precisa esperar ${remainingTime} segundos para usar /${commandName} de novo.`
        )
        .setFooter({ text: BOT_CONFIG.FOOTER_TEXT })
        .setTimestamp();

      // Responde com o aviso (ephemeral para não poluir o chat)
      return await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    }

    // Pega o usuário alvo da zoação
    const alvo = interaction.options.getUser('alvo');

    if (!alvo) {
      return await interaction.reply({
        content: 'Você precisa mencionar alguém para zoar!',
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

    // Registra o cooldown para o usuário
    cooldownService.registerCooldown(userId, commandName, COOLDOWN_DURATION);

    // Incrementa no ranking do MongoDB - note o await e o serverId adicionado
    await incrementUser(alvo.id, interaction.guildId);

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

    // Cria o embed com estilo do bot
    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(`${BOT_CONFIG.ICONS.ZOAR} Zoação Realizada!`)
      .setDescription(fraseEscolhida)
      .setFooter({ text: BOT_CONFIG.FOOTER_TEXT })
      .setTimestamp();

    // Responde com o embed
    await interaction.reply({ embeds: [embed] });
  },
};
