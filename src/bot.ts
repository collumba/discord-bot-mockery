import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import loadEvents from './services/eventHandler';
import commandHandler from './services/commandHandler';
import { connectMongo } from './database/mongo';
import logger from './utils/logger';

// Carrega as variáveis de ambiente
config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
}) as Client & { commands: Collection<string, any> };

(async () => {
  try {
    // Conectar ao MongoDB
    logger.info('Iniciando conexão com MongoDB...');
    await connectMongo();

    // Carregar eventos
    logger.info('Carregando eventos...');
    await loadEvents(client);

    // Carregar comandos
    logger.info('Carregando comandos...');
    await commandHandler.loadCommands(client);

    // Registrar o listener de interações
    logger.info('Registrando listener de interações...');
    await commandHandler.registerCommandHandler(client);

    // Conectar o bot ao Discord
    logger.info('Conectando ao Discord...');
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Bot conectado com sucesso!');
  } catch (error) {
    logger.error('Falha ao inicializar o bot:', error as Error);
    process.exit(1);
  }
})();
