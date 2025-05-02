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
};

export const COMMANDS_CONFIG = {
  HUMILIATE: {
    COOLDOWN_TIME: 10 * 1000, // 10 seconds in milliseconds
    CONTEXT:
      'Gere um insulto humorístico para um usuário do Discord, SOMENTE EM pt-BR, que seja ousado mas não verdadeiramente ofensivo. O insulto deve ser criativo e relacionado a jogos. Use @USER como o espaço reservado para onde o nome de usuário será inserido.',
  },
  MOCK: {
    COOLDOWN_TIME: 30 * 1000, // 30 seconds in milliseconds
    CONTEXT:
      'Gere uma mensagem zombeteira e sarcástica, SOMENTE EM pt-BR, sobre como @USER é ruim em jogos. A mensagem deve ser divertida, não verdadeiramente ofensiva, com referências a erros comuns de jogos, mecânicas ou estereótipos. Use @USER como espaço reservado para o nome de usuário.',
  },
  NICKNAME: {
    COOLDOWN_TIME: 15 * 1000, // 15 seconds in milliseconds
    CONTEXT:
      'Gere um apelido engraçado e criativo, SOMENTE EM pt-BR, para um usuário do Discord baseado na cultura gamer. O apelido deve ser curto, memorável e um pouco provocativo, mas não ofensivo. Use @USER como espaço reservado para onde o nome de usuário será inserido.',
  },
  RANDOMPHRASE: {
    COOLDOWN_TIME: 10 * 1000, // 10 seconds in milliseconds
    CONTEXT:
      'Gere uma frase aleatória e espirituosa, SOMENTE EM pt-BR, da perspectiva de um bot gamer sarcástico e hardcore. A frase deve estar relacionada a jogos, potencialmente referenciando jogos populares, cultura gamer ou estereótipos de gamers. Deve ser humorística, mas não ofensiva.',
  },
  CALLTO: {
    COOLDOWN_TIME: 300 * 1000, // 5 minutes in milliseconds
    PLAY: {
      CONTEXT:
        'Gere uma mensagem curta e entusiasmada, SOMENTE EM pt-BR, convidando membros do Discord para jogar jogos juntos. A mensagem deve ser relacionada a games, casual e motivacional.',
    },
    CHAT: {
      CONTEXT:
        'Gere uma mensagem curta e casual, SOMENTE EM pt-BR, incentivando os usuários do Discord a serem mais ativos no chat. A mensagem deve ser divertida e mencionar como o chat está quieto.',
    },
    EVENT: {
      CONTEXT:
        'Gere uma mensagem curta de anúncio, SOMENTE EM pt-BR, para um evento de jogos. A mensagem deve criar empolgação e urgência, convidando os usuários a participarem de alguma atividade.',
    },
  },
};
// Roast AI settings
export const ROAST_AI_CONFIG = {
  MAX_TOKENS: 512,
  TEMPERATURE: 0.7,
  MODEL: 'local-model',
  API_URL: process.env.LMSTUDIO_API_URL || 'http://localhost:1234/v1',
  FALLBACK_ROASTS: ['Erro ao buscar uma zoeira', 'Você nem merece uma zoeira'],
  PATTERNS: [
    /.*?:\s*(.*)/i, // Matches "Assistant: [response]"
    /.*?response:?\s*(.*)/i, // Matches "Response: [response]"
    /.*?${BOT_CONFIG.NAME}:?\s*(.*)/i, // Matches "BotName: [response]"
  ],
  PROMPT(trigger: string): string {
    return `LANGUAGE INSTRUCTION: RESPOND ONLY IN (${BOT_CONFIG.LANGUAGE}). DO NOT USE ENGLISH UNDER ANY CIRCUMSTANCES.

You are ${BOT_CONFIG.NAME}, a sarcastic, clever, and hardcore gamer.
You are the self-proclaimed leader of the Soberanos guild.
You have deep experience in survival games, shooters, roguelikes, and MMORPGs, including Black Desert Online, Blade and Soul, Mu Online, Throne and Liberty, New World, Tibia, Genshin Impact, Apex Legends, PUBG, Counter-Strike: Source, Risk of Rain 2, Marvel Rivals, Minecraft, Atlas Online, Seven Days to Die, Don't Starve Together, Rust, and Call of Duty.

IMPORTANT ETHICAL RULES:
- You MUST NEVER generate or imply any misogynistic, homophobic, racist, sexist, or xenophobic content.
- You MUST maintain a respectful tone despite sarcasm or humor.
- You are allowed to be playful and provocative, but NEVER offensive, hateful, or discriminatory in any way.

Someone said: "${trigger}" on Discord.

Respond with a funny and provocative one-liner ONLY in ${BOT_CONFIG.LANGUAGE}. Do NOT use English or any other language. Reply ONLY in ${BOT_CONFIG.LANGUAGE}.`;
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
      'O usuário escreveu uma mensagem extremamente longa no Discord. Zoe-o por escrever tanto texto em um app de chat.',
    EMOJI_SPAM: 'O usuário usou muitos emojis na mensagem do Discord. Zoe-o por spam de emojis.',
    ALL_CAPS:
      'O usuário digitou toda a mensagem do Discord em MAIÚSCULAS. Zoe-o por "gritar" no texto.',
    KEYBOARD_SMASH:
      'O usuário bateu no teclado, resultando em texto aleatório como "asdfghjkl" ou "kkkkkkkk". Zoe-o por este comportamento.',
  },
};

// Call To Action settings
export const CALL_TO_CONFIG = {
  AUTO_ENABLED: true, // Enable/disable automatic calls
  MIN_DELAY: 1, // Minimum delay in minutes
  MAX_DELAY: 1, // Maximum delay in minutes
  USE_ROAST_AI: true, // Use roastAI service for generating messages
  COMMAND_COOLDOWN_TIME: 5 * 60 * 1000, // 5 minutes in milliseconds
  // Disable specific call types
  DISABLED_TYPES: ['event'], // Types that are temporarily disabled
  CONTEXTS: {
    play: 'Gere uma mensagem divertida e envolvente, SOMENTE EM pt-BR, convidando os usuários do Discord para jogar juntos. A mensagem deve ser curta, entusiasmada e mencionar jogos. Sinta-se à vontade para referenciar jogos populares ou cultura de jogos.',
    chat: 'Gere uma mensagem casual e amigável, SOMENTE EM pt-BR, convidando os usuários do Discord a participarem de uma conversa. A mensagem deve ser curta e sugerir que o chat está quieto ou precisa de mais atividade.',
    event:
      'Gere uma mensagem empolgante, SOMENTE EM pt-BR, convidando os usuários do Discord a participarem de um evento online. A mensagem deve criar expectativa e urgência, sugerindo que algo divertido está prestes a acontecer.',
    custom:
      'Formate a seguinte mensagem personalizada, SOMENTE EM pt-BR, de uma forma criativa e envolvente para um anúncio no Discord: ',
  },
  // Title emojis for different call types
  TITLES: {
    play: '🎮 Vamos Jogar!',
    chat: '💬 Vamos Conversar!',
    event: '🏆 Hora do Evento!',
    custom: '📣 Atenção!',
  },
};

export default BOT_CONFIG;
