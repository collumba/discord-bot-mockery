import { ColorResolvable } from 'discord.js';

/**
 * Centralized bot configuration
 */
export const BOT_CONFIG = {
  // Basic bot information
  NAME: 'Soberaninha',
  // Default colors for embeds
  COLORS: {
    DEFAULT: 'Random' as ColorResolvable,
    WARNING: 'Yellow' as ColorResolvable,
    ERROR: 'Red' as ColorResolvable,
    SUCCESS: 'Green' as ColorResolvable,
  },

  // Icons for embeds
  ICONS: {
    COOLDOWN: '⏳',
    MOCK: '👑',
    HUMILIATE: '💀',
    NICKNAME: '🎯',
    RANKING: '🏆',
    ERROR: '❌',
    SUCCESS: '✅',
  },

  // Call To Action settings
  CALL_TO: {
    AUTO_ENABLED: true, // Enable/disable automatic calls
    MIN_DELAY: 1, // Minimum delay in minutes
    MAX_DELAY: 1, // Maximum delay in minutes
    DEFAULT_CHANNEL_ID: process.env.DEFAULT_CALL_TO_CHANNEL || '', // Set in .env
  },
  MESSAGE_ROASTER: {
    COOLDOWN_TIME: 5 * 1000, // 5 seconds in milliseconds
    ROAST_CHANCE: 1, // 100% chance to roast for each trigger
  },
};

export default BOT_CONFIG;
