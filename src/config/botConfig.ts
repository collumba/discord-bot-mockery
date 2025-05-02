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
  COMMANDS: {
    HUMILIATE: {
      COOLDOWN_TIME: 300 * 1000, // 5 minutes in milliseconds
      CONTEXT:
        'Generate a humorous insult for a Discord user that is edgy but not truly offensive. The insult should be creative and gaming-related. Use @USER as the placeholder for where the username will be inserted.',
    },
    MOCK: {
      COOLDOWN_TIME: 30 * 1000, // 30 seconds in milliseconds
      CONTEXT:
        'Generate a mocking, sarcastic message about how bad @USER is at gaming. The message should be playful, not truly offensive, with references to common gaming mistakes, mechanics, or stereotypes. Use @USER as the placeholder for the username.',
    },
    NICKNAME: {
      COOLDOWN_TIME: 15 * 1000, // 15 seconds in milliseconds
      CONTEXT:
        'Generate a funny, creative nickname for a Discord user based on gaming culture. The nickname should be short, memorable, and somewhat teasing but not offensive. Use @USER as the placeholder for where the username will be inserted.',
    },
    RANDOMPHRASE: {
      COOLDOWN_TIME: 10 * 1000, // 10 seconds in milliseconds
      CONTEXT:
        'Generate a random, witty phrase from the perspective of a sarcastic, hardcore gamer bot. The phrase should be gaming-related, potentially referencing popular games, gaming culture, or gamer stereotypes. It should be humorous but not offensive.',
    },
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
    /.*?response:?\s*(.*)/i, // Matches "Response: [response]"
    /.*?${BOT_CONFIG.NAME}:?\s*(.*)/i, // Matches "BotName: [response]"
  ],
  PROMPT(trigger: string): string {
    return `you are ${BOT_CONFIG.NAME}, a sarcastic, debonair and hardcore gamer. 
  You are the self-proclaimed leader of the guild Soberanos. 
  You have vast experience in survival games, shooters, roguelikes and MMORPGs, including Black Desert Online, Blade and Soul, Mu Online, Throne and Liberty, New World, Tibia, Genshin Impact, Apex Legends, PUBG, Counter-Strike: Source, Risk of Rain 2, Marvel Rivals, Minecraft, Atlas Online, Seven Days to Die, Don't Starve Together, Rust and Call of Duty. 
  Someone said: "${trigger}" in Discord. 
  Respond with a funny, provocative phrase, in ${BOT_CONFIG.LANGUAGE}. Only one phrase.`;
  },
};

// Presence Roaster settings
export const PRESENCE_ROASTER_CONFIG = {
  ENABLED: true, // Enable/disable game roasting
  ROAST_CHANCE: 1, // 20% chance to roast
  COOLDOWN_TIME: 1, // Cooldown in minutes
  GAMES: {
    LEAGUE_OF_LEGENDS: {
      CONTEXT: 'League of Legends é conhecido por sua comunidade competitiva e partidas intensas.',
      ROASTS: ['league_of_legends'],
    },
    VALORANT: {
      CONTEXT: 'Valorant é um FPS tático onde a mira e o posicionamento são cruciais.',
      ROASTS: ['valorant'],
    },
    FORTNITE: {
      CONTEXT: 'Fortnite é famoso por suas construções rápidas e eventos ao vivo.',
      ROASTS: ['fortnite'],
    },
    MINECRAFT: {
      CONTEXT: 'Minecraft permite criatividade ilimitada em um mundo de blocos.',
      ROASTS: ['minecraft'],
    },
    CALL_OF_DUTY: {
      CONTEXT: 'Call of Duty é uma série de FPS com campanhas intensas e multiplayer competitivo.',
      ROASTS: ['call_of_duty'],
    },
    COUNTER_STRIKE: {
      CONTEXT: 'Counter-Strike é um clássico dos FPS táticos, exigindo estratégia e precisão.',
      ROASTS: ['counter_strike'],
    },
    APEX_LEGENDS: {
      CONTEXT: 'Apex Legends é um battle royale com heróis únicos e jogabilidade rápida.',
      ROASTS: ['apex_legends'],
    },
    OVERWATCH: {
      CONTEXT: 'Overwatch combina heróis diversos em batalhas em equipe cheias de ação.',
      ROASTS: ['overwatch'],
    },
    DOTA_2: {
      CONTEXT: 'Dota 2 é um MOBA complexo com uma curva de aprendizado acentuada.',
      ROASTS: ['dota_2'],
    },
    WORLD_OF_WARCRAFT: {
      CONTEXT: 'World of Warcraft é um MMORPG lendário com vastos mundos e raides épicos.',
      ROASTS: ['world_of_warcraft'],
    },
  },
};

// Message Roaster settings
export const MESSAGE_ROASTER_CONFIG = {
  COOLDOWN_TIME: 5 * 1000, // 5 seconds in milliseconds
  ROAST_CHANCE: 1, // 100% chance to roast for each trigger
  ROAST_CONTEXTS: {
    LONG_MESSAGE:
      'The user wrote an extremely long message on Discord. Roast them for writing too much text in a chat app.',
    EMOJI_SPAM:
      'The user used too many emojis in their Discord message. Roast them for emoji spamming.',
    ALL_CAPS:
      "The user typed their entire Discord message in ALL CAPS. Roast them for 'shouting' in text.",
    KEYBOARD_SMASH:
      "The user smashed their keyboard, resulting in random gibberish like 'asdfghjkl' or 'kkkkkkkk'. Roast them for keyboard smashing.",
  },
};

// Call To Action settings
export const CALL_TO_CONFIG = {
  AUTO_ENABLED: true, // Enable/disable automatic calls
  MIN_DELAY: 1, // Minimum delay in minutes
  MAX_DELAY: 1, // Maximum delay in minutes
  USE_ROAST_AI: true, // Use roastAI service for generating messages
  COMMAND_COOLDOWN_TIME: 5 * 60 * 1000, // 5 minutes in milliseconds
  CONTEXTS: {
    play: 'Generate a fun, engaging call-to-action message inviting Discord users to play games together. The message should be short, enthusiastic, and mention gaming. Feel free to reference popular games or gaming culture.',
    chat: 'Generate a casual, friendly call-to-action message inviting Discord users to join a conversation. The message should be short and suggest the chat is getting quiet or needs more activity.',
    event:
      'Generate an exciting call-to-action message inviting Discord users to join an online event. The message should create anticipation and urgency, suggesting something fun is about to happen.',
    custom:
      'Format the following custom message in a creative and engaging way for a Discord announcement: ',
  },
  // Title emojis for different call types
  TITLES: {
    play: "🎮 Let's Play!",
    chat: "💬 Let's Chat!",
    event: '🏆 Event Time!',
    custom: '📣 Attention!',
  },
};

export default BOT_CONFIG;
