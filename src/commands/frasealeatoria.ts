import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('frasealeatoria')
    .setDescription('Solta uma frase aleatória da zoeira da Soberaninha.'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const frases = [
      'Quem nunca caiu do servidor que atire o primeiro lag!',
      'A Soberaninha viu sua gameplay... e preferiu esquecer.',
      'Se seu jogo tivesse física real, você nem andava direito.',
      'Com essa mira, era melhor jogar adivinhação.',
      'Se habilidade fosse loot, você estaria sem inventário.'
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    await interaction.reply(frase);
  }
};
