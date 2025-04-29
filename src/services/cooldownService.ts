import logger from '../utils/logger';

/**
 * Armazena os cooldowns dos usuários por comando
 * Estrutura: Map<userId, Map<commandName, expirationTimestamp>>
 */
const cooldowns = new Map<string, Map<string, number>>();

/**
 * Verifica se um usuário está em cooldown para um comando específico
 * @param userId ID do usuário
 * @param commandName Nome do comando
 * @returns True se o usuário estiver em cooldown, False caso contrário
 */
export function isInCooldown(userId: string, commandName: string): boolean {
  // Verifica se o usuário tem algum cooldown registrado
  if (!cooldowns.has(userId)) {
    return false;
  }

  const userCooldowns = cooldowns.get(userId);

  // Verifica se o usuário tem cooldown para este comando específico
  if (!userCooldowns?.has(commandName)) {
    return false;
  }

  // Obtém o timestamp de expiração
  const expirationTime = userCooldowns.get(commandName) as number;

  // Verifica se ainda está em cooldown
  const currentTime = Date.now();

  if (currentTime < expirationTime) {
    return true;
  } else {
    // Se o cooldown expirou, remove-o da lista
    userCooldowns.delete(commandName);
    return false;
  }
}

/**
 * Registra um cooldown para um usuário e comando
 * @param userId ID do usuário
 * @param commandName Nome do comando
 * @param seconds Duração do cooldown em segundos
 */
export function registerCooldown(userId: string, commandName: string, seconds: number): void {
  // Calcula o timestamp de expiração
  const expirationTime = Date.now() + seconds * 1000;

  // Registra o cooldown para o usuário/comando
  if (!cooldowns.has(userId)) {
    cooldowns.set(userId, new Map<string, number>());
  }

  const userCooldowns = cooldowns.get(userId) as Map<string, number>;
  userCooldowns.set(commandName, expirationTime);

  logger.debug(`Cooldown registrado para ${userId} no comando ${commandName} por ${seconds}s`);
}

/**
 * Retorna o tempo restante em segundos para um cooldown específico
 * @param userId ID do usuário
 * @param commandName Nome do comando
 * @returns Tempo restante em segundos ou 0 se não estiver em cooldown
 */
export function getRemainingCooldown(userId: string, commandName: string): number {
  if (!cooldowns.has(userId)) {
    return 0;
  }

  const userCooldowns = cooldowns.get(userId);

  if (!userCooldowns?.has(commandName)) {
    return 0;
  }

  const expirationTime = userCooldowns.get(commandName) as number;
  const currentTime = Date.now();

  if (currentTime < expirationTime) {
    // Retorna o tempo restante em segundos, arredondado para cima
    return Math.ceil((expirationTime - currentTime) / 1000);
  }

  return 0;
}

/**
 * Limpa cooldowns expirados periodicamente para evitar uso excessivo de memória
 */
function cleanupExpiredCooldowns(): void {
  const currentTime = Date.now();

  cooldowns.forEach((userCooldowns, userId) => {
    // Filtra e remove os cooldowns expirados
    let hasRemovedEntries = false;

    userCooldowns.forEach((expirationTime, command) => {
      if (currentTime > expirationTime) {
        userCooldowns.delete(command);
        hasRemovedEntries = true;
      }
    });

    // Se o usuário não tem mais cooldowns, remove o usuário do Map
    if (userCooldowns.size === 0 || hasRemovedEntries) {
      if (userCooldowns.size === 0) {
        cooldowns.delete(userId);
      }
      logger.debug(`Cooldowns limpos para o usuário ${userId}`);
    }
  });
}

// Executa limpeza a cada 5 minutos
setInterval(cleanupExpiredCooldowns, 5 * 60 * 1000);

export default {
  isInCooldown,
  registerCooldown,
  getRemainingCooldown,
};
