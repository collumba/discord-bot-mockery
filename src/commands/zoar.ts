import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  UserMention,
} from 'discord.js';
import { incrementUser } from '../services/rankingService';
import cooldownService from '../services/cooldownService';
import BOT_CONFIG from '../config/botConfig';
import { t } from '../services/i18nService';

// Configuração do cooldown para o comando zoar (em segundos)
const COOLDOWN_DURATION = 20;

export default {
  data: new SlashCommandBuilder()
    .setName('zoar')
    .setDescription(t('commands.zoar.builder.description'))
    .addUserOption((option) =>
      option
        .setName('alvo')
        .setDescription(t('commands.zoar.builder.options.alvo'))
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const commandName = interaction.commandName;

    // Verifica se o usuário está em cooldown
    if (cooldownService.isInCooldown(userId, commandName)) {
      const remainingTime = cooldownService.getRemainingCooldown(userId, commandName);

      // Cria o embed de aviso de cooldown usando i18n
      const cooldownEmbed = new EmbedBuilder()
        .setColor(BOT_CONFIG.COLORS.WARNING)
        .setTitle(
          `${BOT_CONFIG.ICONS.COOLDOWN} ${t('cooldown.wait', {
            seconds: remainingTime,
            command: commandName,
          })}`
        )
        .setFooter({
          text: t('footer', { botName: BOT_CONFIG.NAME }),
        })
        .setTimestamp();

      // Responde com o aviso (ephemeral para não poluir o chat)
      return await interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    }

    // Pega o usuário alvo da zoação
    const alvo = interaction.options.getUser('alvo');

    if (!alvo) {
      return await interaction.reply({
        content: t('errors.user_not_found'),
        ephemeral: true,
      });
    }

    // Verifica se o comando está sendo usado em um servidor
    if (!interaction.guildId) {
      return await interaction.reply({
        content: t('errors.server_only'),
        ephemeral: true,
      });
    }

    // Registra o cooldown para o usuário
    cooldownService.registerCooldown(userId, commandName, COOLDOWN_DURATION);

    // Incrementa no ranking do MongoDB
    await incrementUser(alvo.id, interaction.guildId);

    // Obtém as frases zoeiras do arquivo de tradução
    const frasesZoeiras = t('commands.zoar.phrases').split('.,');

    // Seleciona uma frase aleatória
    const fraseEscolhida = frasesZoeiras[Math.floor(Math.random() * frasesZoeiras.length)];

    // Processa os placeholders na frase
    const fraseProcessada = fraseEscolhida.replace(/{alvo}/g, alvo.toString());

    // Cria o embed com estilo do bot usando i18n
    const embed = new EmbedBuilder()
      .setColor(BOT_CONFIG.COLORS.DEFAULT)
      .setTitle(`${BOT_CONFIG.ICONS.ZOAR} ${t('commands.zoar.title')}`)
      .setDescription(fraseProcessada)
      .setFooter({
        text: t('footer', { botName: BOT_CONFIG.NAME }),
      })
      .setTimestamp();

    // Responde com o embed
    await interaction.reply({ embeds: [embed] });
  },
};
