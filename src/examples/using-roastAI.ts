/**
 * Exemplos de implementação do roastAI nos serviços do bot
 */
import { Message, Presence, ActivityType, TextChannel } from 'discord.js';
import { getReliableRoast } from '../services/roastAI';
import logger from '../utils/logger';
import { guardActiveChannelMessage } from '../utils/activeChannelGuard';

/**
 * Exemplo de integração com o messageRoaster
 * Processa uma mensagem do Discord e responde com uma zombaria gerada pela IA
 * @param message Mensagem do Discord
 */
export async function handleMessageWithAI(message: Message): Promise<void> {
  try {
    // Ignorar mensagens de bots
    if (message.author.bot) return;

    // Verificar se o bot pode responder neste canal
    if (!(await guardActiveChannelMessage(message))) {
      return;
    }

    // Verificar se a mensagem tem pelo menos 5 palavras para ter contexto suficiente
    const words = message.content.split(/\s+/).filter((word) => word.length > 0);
    if (words.length < 5) {
      return;
    }

    // Probabilidade de responder (20% por exemplo)
    if (Math.random() > 0.2) {
      return;
    }

    // Obter a zombaria da IA
    const roast = await getReliableRoast(message.content);

    // Responder à mensagem
    await message.reply(roast);

    logger.info(`Respondeu a ${message.author.username} com roast AI: "${roast}"`);
  } catch (error) {
    logger.error(
      `Erro no handleMessageWithAI: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Exemplo de integração com o presenceRoaster
 * Envia uma zombaria sobre atividade de jogo gerada pela IA
 * @param presence Presença do Discord
 * @param channel Canal de texto para enviar a mensagem
 */
export async function handleGamePresenceWithAI(
  presence: Presence,
  channel: TextChannel
): Promise<void> {
  try {
    // Ignorar bots
    if (presence.member?.user.bot) return;

    // Verificar se há atividade de jogo
    const gameActivity = presence.activities.find(
      (activity) => activity.type === ActivityType.Playing
    );

    if (!gameActivity || !gameActivity.name) {
      return;
    }

    // Criar um trigger que menciona o nome do usuário e do jogo
    const username = presence.member?.displayName || 'usuário';
    const gameName = gameActivity.name;

    const trigger = `${username} está jogando ${gameName}`;

    // Obter zombaria da IA
    const roast = await getReliableRoast(trigger);

    // Enviar mensagem para o canal
    await channel.send(roast);

    logger.info(`Enviou roast AI para ${username} jogando ${gameName}: "${roast}"`);
  } catch (error) {
    logger.error(
      `Erro no handleGamePresenceWithAI: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Exemplo de como implementar o roastAI no messageRoaster.ts
 */
export function messageRoasterImplementationExample(): string {
  return `
// Dentro de messageRoaster.ts

import { Message } from 'discord.js';
import { getReliableRoast } from '../services/roastAI';
import { isInActiveChannel } from '../services/guildConfigService';
import logger from '../utils/logger';

export async function processMessage(message: Message): Promise<void> {
  try {
    // Ignorar mensagens de bots
    if (message.author.bot) return;
    
    // Verificar canal ativo
    if (!(await isInActiveChannel(message))) return;
    
    // Lógica para decidir quando responder (exemplo: 10% de chance)
    if (Math.random() > 0.1) return;
    
    // Obter zombaria da IA com base na mensagem
    const roast = await getReliableRoast(message.content);
    
    // Responder à mensagem
    await message.reply(roast);
    
  } catch (error) {
    logger.error(\`Erro no processMessage: \${error instanceof Error ? error.message : String(error)}\`);
  }
}
  `;
}

/**
 * Exemplo de como implementar o roastAI no presenceRoaster.ts
 */
export function presenceRoasterImplementationExample(): string {
  return `
// Dentro de presenceRoaster.ts

import { Client, Presence, TextChannel, ActivityType } from 'discord.js';
import { getReliableRoast } from '../services/roastAI';
import { getActiveChannel } from '../services/guildConfigService';
import logger from '../utils/logger';

export async function handlePresenceUpdate(oldPresence: Presence | null, newPresence: Presence, client: Client): Promise<void> {
  try {
    // Verificações básicas
    if (!newPresence.guild || !newPresence.member || newPresence.member.user.bot) return;
    
    // Verificar se há atividade de jogo nova
    const gameActivity = newPresence.activities.find(activity => activity.type === ActivityType.Playing);
    
    // Verificar se é uma nova atividade (não estava no oldPresence)
    if (!gameActivity || oldPresence?.activities.some(a => a.type === ActivityType.Playing && a.name === gameActivity.name)) {
      return;
    }
    
    // Obter o canal ativo para o servidor
    const channelId = await getActiveChannel(newPresence.guild.id);
    if (!channelId) return;
    
    // Obter o canal
    const channel = await client.channels.fetch(channelId) as TextChannel;
    if (!channel || !channel.isTextBased()) return;
    
    // Criar trigger
    const username = newPresence.member.displayName;
    const gameName = gameActivity.name;
    const trigger = \`\${username} está jogando \${gameName}\`;
    
    // Obter zombaria da IA
    const roast = await getReliableRoast(trigger);
    
    // Enviar para o canal
    await channel.send(roast);
    
  } catch (error) {
    logger.error(\`Erro no handlePresenceUpdate: \${error instanceof Error ? error.message : String(error)}\`);
  }
}
  `;
}
