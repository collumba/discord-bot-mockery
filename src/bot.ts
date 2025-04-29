import { client } from './config/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CommandHandler from './services/commandHandler.js';

// Obter o caminho do diretório atual com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregamento automático de eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const eventModule = await import(filePath);
  const event = eventModule.default;
  
  if (typeof event === 'function') {
    event();
    console.log(`Evento carregado: ${file}`);
  }
}

// Inicializar handler de comandos
const commandHandler = new CommandHandler(client);
await commandHandler.loadCommands();
commandHandler.registerEvents();
console.log('Comandos carregados e eventos registrados');

// Login do bot usando o token do .env
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log('Bot conectado com sucesso!');
  })
  .catch((error: Error) => {
    console.error('Erro ao conectar o bot:', error);
    process.exit(1);
  }); 