import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('zoar')
    .setDescription('Zoar alguém aleatoriamente.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Usuário para zoar')
        .setRequired(true)
    ),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user');
    if (!user) {
      return interaction.reply({ content: 'Não encontrei esse usuário.', ephemeral: true });
    }

    const zoeiras = [
      `@${user.username} tentou ser útil hoje, mas falhou miseravelmente.`,
      `@${user.username} é o tipo de pessoa que perde no tutorial.`,
      `@${user.username} ainda acredita que main healer é DPS.`,
      `@${user.username} é tão rápido quanto um lag de 400ms.`,
      `@${user.username} já tá quase virando bot de tão ruim.`
    ];

    const frase = zoeiras[Math.floor(Math.random() * zoeiras.length)];

    await interaction.reply(frase);
  }
};
