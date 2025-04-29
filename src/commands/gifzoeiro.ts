import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gifzoeiro')
    .setDescription('Manda um GIF zoeiro aleatório.'),

  async execute(interaction: ChatInputCommandInteraction) {
    return interaction.reply('Desativado por enquanto.');
    const gifs = [
      'https://media.tenor.com/7hbPVL8h9qsAAAAC/kiss.gif',
      'https://media.tenor.com/u9-XW_mUB60AAAAC/laugh-funny.gif',
      'https://media.tenor.com/GVuVtU6cTssAAAAC/rofl-laughing.gif',
      'https://media.tenor.com/W0N1lXCeNqgAAAAC/smile-smirk.gif',
      'https://media.tenor.com/h1Uo-IKhV5sAAAAC/facepalm-fail.gif',
    ];

    const gif = gifs[Math.floor(Math.random() * gifs.length)];

    await interaction.reply(gif);
  },
};
