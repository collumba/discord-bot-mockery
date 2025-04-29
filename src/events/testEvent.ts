import { Events, Client } from 'discord.js';
import logger from '../utils/logger';

export const name = Events.Debug;
export const once = false;

export function execute(info: string) {
  // Log apenas ocasionalmente para não sobrecarregar com informações
  if (Math.random() < 0.05) {
    logger.debug(`[TestEvent] Discord debug info: ${info}`);
  }
}
