import { Client, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  if (client.user) {
    console.log(`Soberaninha está online! Logado como ${client.user.tag}`);
  }
} 