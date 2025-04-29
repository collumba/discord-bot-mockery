import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';

export default {
  data: new SlashCommandBuilder()
    .setName('frasealeatoria')
    .setDescription(`Solta uma frase aleatória da zoeira da ${BOT_CONFIG.NAME}.`),

  async execute(interaction: ChatInputCommandInteraction) {
    const frases = [
      'Quem nunca caiu do servidor que atire o primeiro lag!',
      `A ${BOT_CONFIG.NAME} viu s ua gameplay... e preferiu esquecer.`,
      'Se seu jogo tivesse física real, você nem andava direito.',
      'Com essa mira, era melhor jogar adivinhação.',
      'Se habilidade fosse loot, você estaria sem inventário.',
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    await interaction.reply(frase);
  },
};
