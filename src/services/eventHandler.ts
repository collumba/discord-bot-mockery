import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

/**
 * Interface para eventos do Discord
 */
interface Event {
  name: string;
  once?: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void> | void;
}

/**
 * Carrega todos os eventos da pasta events/ e os registra no client
 * @param client Cliente Discord.js
 */
async function loadEvents(client: Client): Promise<void> {
  try {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.ts')
    );

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (!event.name) {
          logger.warn(`Evento ${file} não possui propriedade 'name'`);
          continue;
        }

        if (!event.execute || typeof event.execute !== 'function') {
          logger.warn(`Evento ${file} não possui método 'execute'`);
          continue;
        }

        // Registra o evento baseado na propriedade 'once'
        if (event.once) {
          client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
          client.on(event.name, (...args) => event.execute(client, ...args));
        }

        logger.info(`Evento carregado: ${file} [${event.name}${event.once ? ' - once' : ''}]`);
      } catch (error) {
        logger.error(`Erro ao carregar evento ${file}`, error as Error);
      }
    }
    
    logger.info('Todos os eventos foram carregados');
  } catch (error) {
    logger.error('Erro ao carregar eventos', error as Error);
  }
}

export default loadEvents; 