import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';


export default {
  data: new SlashCommandBuilder()
    .setName('apelido')
    .setDescription('Sugere um apelido engraçado para alguém.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Usuário para apelidar')
        .setRequired(true)
    ),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user');
    if (!user) {
      return interaction.reply({ content: 'Não encontrei esse usuário.', ephemeral: true });
    }

    const apelidos = [
      'LagLord',
      'BugMaster',
      'Noobzera',
      'Crashador',
      'Feedador Oficial',
      'Rei do Respawn'
    ];

    const apelido = apelidos[Math.floor(Math.random() * apelidos.length)];

    await interaction.reply(`@${user.username} agora é conhecido como **${apelido}**!`);
  }
};
