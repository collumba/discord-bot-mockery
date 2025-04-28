import { client } from './config/client';

// Importação de eventos
import './events/ready';

// Login do bot usando o token do .env
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log('Bot conectado com sucesso!');
  })
  .catch((error: Error) => {
    console.error('Erro ao conectar o bot:', error);
    process.exit(1);
  }); 