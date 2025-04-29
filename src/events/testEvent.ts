import { Client } from 'discord.js';

export const name = 'messageCreate';
export const once = false;

export async function execute(client: Client, message: any) {
  console.log(`[TESTE] Mensagem recebida: ${message.content}`);
}