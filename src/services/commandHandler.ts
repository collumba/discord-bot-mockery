import { Client, Collection, Events, Interaction } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

// Tipo para os comandos
interface Command {
  data: any;
  execute: (interaction: Interaction) => Promise<void>;
}

class CommandHandler {
  private client: Client;
  private commands: Collection<string, Command>;

  constructor(client: Client) {
    this.client = client;
    this.commands = new Collection<string, Command>();
  }

  async loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      try {
        const command = (await import(filePath)).default;
        if ('data' in command && 'execute' in command) {
          this.commands.set(command.data.name, command);
          logger.info(`Comando carregado: ${command.data.name}`);
        } else {
          logger.warn(`O comando ${file} está faltando uma propriedade "data" ou "execute" obrigatória.`);
        }
      } catch (error) {
        logger.error(`Erro ao carregar comando ${file}`, error as Error);
      }
    }
  }

  registerEvents() {
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = this.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`Comando não encontrado: ${interaction.commandName}`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(`Erro ao executar comando ${interaction.commandName}`, error as Error);
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
        }
      }
    });
  }
}

export default CommandHandler; 