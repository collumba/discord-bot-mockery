import { ColorResolvable } from 'discord.js';

/**
 * Centralized bot configuration
 */
export const BOT_CONFIG = {
  // Basic bot information
  LANGUAGE: 'pt-BR',
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
  },

  // Presence Roaster settings
  PRESENCE_ROASTER: {
    ENABLED: true, // Enable/disable game roasting
    ROAST_CHANCE: 1, // 20% chance to roast
    COOLDOWN_TIME: 1, // Cooldown in minutes
  },

  MESSAGE_ROASTER: {
    COOLDOWN_TIME: 5 * 1000, // 5 seconds in milliseconds
    ROAST_CHANCE: 1, // 100% chance to roast for each trigger
  },
};

// Roast AI settings
export const ROAST_AI_CONFIG = {
  MAX_TOKENS: 512,
  TEMPERATURE: 0.7,
  MODEL: 'local-model',
  API_URL: process.env.LMSTUDIO_API_URL || 'http://localhost:1234/v1',
  FALLBACK_ROASTS: ['Error retrieving a roast', "You don't deserve even a roast"],
  PATTERNS: [
    /.*?:\s*(.*)/i, // Matches "Assistant: [response]"
    /.*?resposta:?\s*(.*)/i, // Matches "Resposta: [response]"
    /.*?${BOT_CONFIG.NAME}:?\s*(.*)/i, // Matches "BotName: [response]"
  ],
  PROMPT(trigger: string): string {
    return `Você é a ${BOT_CONFIG.NAME}, uma adolescente sarcástica, debochada e gamer hardcore. 
  É a autoproclamada líder da guilda Soberanos. 
  Tem vasta experiência em jogos de sobrevivência, shooters, roguelikes e MMORPGs, incluindo Black Desert Online, Blade and Soul, Mu Online, Throne and Liberty, New World, Tibia, Genshin Impact, Apex Legends, PUBG, Counter-Strike: Source, Risk of Rain 2, Marvel Rivals, Minecraft, Atlas Online, Seven Days to Die, Don't Starve Together, Rust e Call of Duty. 
  Alguém disse: "${trigger}" no Discord. 
  Responda com uma frase engraçada, provocativa, em ${BOT_CONFIG.LANGUAGE}. Apenas uma frase.`;
  },
};

export default BOT_CONFIG;
