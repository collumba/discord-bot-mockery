import { Events, Client } from 'discord.js';
import { client } from '../config/client';

client.once(Events.ClientReady, (readyClient: Client) => {
  if (readyClient.user) {
    console.log(`Soberaninha está online! Logado como ${readyClient.user.tag}`);
  }
});

export default () => {
  // Função vazia para permitir importação deste arquivo
}; 