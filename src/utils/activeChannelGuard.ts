import { ChatInputCommandInteraction, Message } from 'discord.js';
import { isInActiveChannel } from '../services/guildConfigService';
import { t } from '../services/i18nService';
import logger from './logger';

/**
 * Middleware to check if an interaction is in the active channel
 * @param interaction - Discord interaction
 * @returns Promise<boolean> - true if allowed to proceed, false if blocked
 */
export async function guardActiveChannel(
  interaction: ChatInputCommandInteraction
): Promise<boolean> {
  try {
    // Check if the command is the set-active-channel command, which should work in any channel
    if (interaction.commandName === 'set-active-channel') {
      return true;
    }

    // Check if the interaction is in the active channel
    if (!(await isInActiveChannel(interaction))) {
      // If not, respond with an ephemeral message
      await interaction.reply({
        content: t('errors.wrong_channel'),
        ephemeral: true,
      });

      logger.debug(
        `Command ${interaction.commandName} blocked: used outside the active channel in server ${interaction.guildId}`
      );

      return false;
    }

    // If in the correct channel, allow the command
    return true;
  } catch (error) {
    logger.error(
      `Erro ao verificar canal ativo: ${error instanceof Error ? error.message : String(error)}`
    );
    // In case of error, allow the command by security
    return true;
  }
}

/**
 * Middleware to check if a message is in the active channel (version for message events)
 * @param message - Discord message
 * @returns Promise<boolean> - true if allowed to proceed, false if blocked
 */
export async function guardActiveChannelMessage(message: Message): Promise<boolean> {
  try {
    // Check if the message is in the active channel
    if (!(await isInActiveChannel(message))) {
      // For messages, we silently ignore without responding
      logger.debug(
        `Processamento de mensagem bloqueado: mensagem enviada fora do canal ativo no servidor ${message.guildId}`
      );
      return false;
    }

    // If in the correct channel, allow the processing
    return true;
  } catch (error) {
    logger.error(
      `Erro ao verificar canal ativo para mensagem: ${error instanceof Error ? error.message : String(error)}`
    );
    // In case of error, allow the processing by security
    return true;
  }
}

export default {
  guardActiveChannel,
  guardActiveChannelMessage,
};
