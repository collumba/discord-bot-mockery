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
};

export default BOT_CONFIG;
