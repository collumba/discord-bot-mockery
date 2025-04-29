import { Events, Client } from 'discord.js';
import { client } from '../config/client.js';

// Exporta uma função que registra o evento ready
export default () => {
  client.once(Events.ClientReady, (readyClient: Client) => {
    if (readyClient.user) {
      console.log(`Soberaninha está online! Logado como ${readyClient.user.tag}`);
    }
  });
}; 