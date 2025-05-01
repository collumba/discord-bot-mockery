import { Client, Events, Message } from 'discord.js';
import { guardActiveChannelMessage } from '../utils/activeChannelGuard';
import { t } from '../services/i18nService';
import logger from '../utils/logger';

export const name = Events.MessageCreate;
export const once = false;

/**
 * Handle incoming messages with active channel guard
 * @param message The received message
 */
export async function execute(message: Message): Promise<void> {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Verifica se a mensagem está no canal ativo antes de processá-la
  if (!(await guardActiveChannelMessage(message))) {
    // Se não estiver, a função guardActiveChannelMessage já registrou o log
    // e não precisamos fazer nada, apenas retornar
    return;
  }

  // A partir daqui, garantimos que a mensagem está no canal certo
  // e podemos processar normalmente
  logger.info(`Processando mensagem no canal ativo: ${message.content}`);

  // Exemplo de processamento de mensagem
  if (message.content.toLowerCase() === 'hello') {
    await message.reply(t('commands.set_active_channel.examples.message_response'));
  }
}
