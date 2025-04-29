import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

/**
 * Interface for Discord events
 */
interface Event {
  name: string;
  once?: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void> | void;
}

async function loadEvents(client: Client): Promise<void> {
  try {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (!event.name) {
          logger.warn(`Event ${file} does not have 'name' property`);
          continue;
        }

        if (!event.execute || typeof event.execute !== 'function') {
          logger.warn(`Event ${file} does not have 'execute' method`);
          continue;
        }

        // Registers the event based on the 'once' property
        if (event.once) {
          client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
          client.on(event.name, (...args) => event.execute(client, ...args));
        }

        logger.info(`Event loaded: ${file} [${event.name}${event.once ? ' - once' : ''}]`);
      } catch (error) {
        logger.error(`Error loading event ${file}`, error as Error);
      }
    }

    logger.info('All events loaded');
  } catch (error) {
    logger.error('Error loading events', error as Error);
  }
}

export default loadEvents;
