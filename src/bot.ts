import { client } from './config/client';
import commandHandler from './services/commandHandler';
import loadEvents from './services/eventHandler';

async function main() {
  try {
    // Inicializar o handler de eventos
    await loadEvents(client);
    
    // Inicializar handler de comandos
    await commandHandler.loadCommands(client);
    commandHandler.registerCommandHandler(client);
    console.log('Comandos carregados e eventos registrados');

    // Login do bot usando o token do .env
    await client.login(process.env.DISCORD_TOKEN);
    console.log('Bot conectado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o bot:', error);
    process.exit(1);
  }
}

main(); 