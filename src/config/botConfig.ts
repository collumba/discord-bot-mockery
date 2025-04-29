import { ColorResolvable } from 'discord.js';

/**
 * Configurações centralizadas do bot
 */
export const BOT_CONFIG = {
  // Informações básicas do bot
  NAME: 'Soberaninha',
  // Cores padrão para embeds
  COLORS: {
    DEFAULT: 'Random' as ColorResolvable,
    WARNING: 'Yellow' as ColorResolvable,
    ERROR: 'Red' as ColorResolvable,
    SUCCESS: 'Green' as ColorResolvable,
  },

  // Ícones para os embeds
  ICONS: {
    COOLDOWN: '⏳',
    ZOAR: '👑',
    HUMILHAR: '💀',
    APELIDO: '🎯',
    RANKING: '🏆',
    ERROR: '❌',
    SUCCESS: '✅',
  },
};

export default BOT_CONFIG;
