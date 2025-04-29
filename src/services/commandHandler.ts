import { Client, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

/**
 * Interface para comandos do Discord
 */
export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

/**
 * Declara a propriedade commands na interface Client do Discord.js
 */
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

/**
 * Carrega todos os comandos da pasta commands/ e os registra no client
 * @param client Cliente Discord.js
 */
async function loadCommands(client: Client): Promise<void> {
  try {
    // Inicializa a collection se não existir
    if (!client.commands) {
      client.commands = new Collection<string, Command>();
    }

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.ts')
    );

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath).default;

        // Validações do comando
        if (!command.data) {
          logger.warn(`Comando ${file} não possui propriedade 'data'`);
          continue;
        }

        if (!command.execute || typeof command.execute !== 'function') {
          logger.warn(`Comando ${file} não possui método 'execute'`);
          continue;
        }

        // Adiciona o comando à collection
        client.commands.set(command.data.name, command);
        logger.info(`Comando carregado: ${file} [${command.data.name}]`);
      } catch (error) {
        logger.error(`Erro ao carregar comando ${file}`, error as Error);
      }
    }
    
    logger.info(`Total de ${client.commands.size} comandos carregados`);
  } catch (error) {
    logger.error('Erro ao carregar comandos', error as Error);
  }
}

/**
 * Registra o evento interactionCreate para handling dos comandos
 * @param client Cliente Discord.js
 */
function registerCommandHandler(client: Client): void {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
      logger.warn(`Comando não encontrado: ${interaction.commandName}`);
      return;
    }
    
    try {
      await command.execute(interaction as CommandInteraction);
    } catch (error) {
      logger.error(`Erro ao executar comando ${interaction.commandName}`, error as Error);
      
      const errorMessage = 'Ocorreu um erro ao executar este comando!';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });
  
  logger.info('Handler de interações de comandos registrado');
}

export default {
  loadCommands,
  registerCommandHandler
}; 