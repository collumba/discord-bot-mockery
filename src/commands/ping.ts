import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!'),
    
  async execute(interaction: CommandInteraction) {
    await interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
  }
}; 