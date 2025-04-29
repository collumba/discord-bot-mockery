import { Client, Events } from 'discord.js';
import BOT_CONFIG from '../config/botConfig';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  if (client.user) {
    console.log(`${BOT_CONFIG.NAME} está online! Logado como ${client.user.tag}`);
  }
}
