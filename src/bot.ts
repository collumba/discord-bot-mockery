import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import loadEvents from './services/eventHandler';
import commandHandler from './services/commandHandler'; // Importa como objeto

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as Client & { commands: Collection<string, any> }; // Tipar o client

(async () => {
  try {
    // Carregar eventos
    await loadEvents(client);

    // Carregar comandos
    await commandHandler.loadCommands(client);

    // Registrar o listener de interações
    await commandHandler.registerCommandHandler(client);

    await client.login(process.env.DISCORD_TOKEN);
    console.log('[INFO] Bot conectado com sucesso!');
  } catch (error) {
    console.error('[ERRO] Falha ao inicializar o bot:', error);
  }
})();
