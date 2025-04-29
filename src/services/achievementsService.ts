import Achievement, { IAchievement } from '../models/Achievement';
import { incrementUser, getCountForUser, getUniqueTargetsCount } from './rankingService';
import logger from '../utils/logger';
import { t } from './i18nService';

/**
 * Tipos de eventos que podem conceder achievements
 */
export type AchievementEventType = 'zoado' | 'zoou' | 'apelido';

/**
 * Interface para definição de um achievement
 */
export interface AchievementDefinition {
  id: string;
  translationKey: string;
  condition: (userId: string, serverId: string) => Promise<boolean>;
  type: AchievementEventType[];
}

/**
 * Lista de achievements disponíveis
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'zoado_10',
    translationKey: 'achievements.zoado_10',
    condition: async (userId: string, serverId: string) => {
      const count = await getCountForUser(userId, serverId);
      return count >= 10;
    },
    type: ['zoado'],
  },
  {
    id: 'zoado_50',
    translationKey: 'achievements.zoado_50',
    condition: async (userId: string, serverId: string) => {
      const count = await getCountForUser(userId, serverId);
      return count >= 50;
    },
    type: ['zoado'],
  },
  {
    id: 'zoado_100',
    translationKey: 'achievements.zoado_100',
    condition: async (userId: string, serverId: string) => {
      const count = await getCountForUser(userId, serverId);
      return count >= 100;
    },
    type: ['zoado'],
  },
  {
    id: 'zoador_30',
    translationKey: 'achievements.zoador_30',
    condition: async (userId: string, serverId: string) => {
      const count = await getUniqueTargetsCount(userId, serverId);
      return count >= 30;
    },
    type: ['zoou'],
  },
  {
    id: 'apelidador_20',
    translationKey: 'achievements.apelidador_20',
    condition: async (userId: string, serverId: string) => {
      const count = await getUniqueTargetsCount(userId, serverId, 'apelido');
      return count >= 20;
    },
    type: ['apelido'],
  },
];

/**
 * Busca ou cria o documento de achievements de um usuário
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @returns Documento de achievements
 */
export async function getOrCreateUserAchievements(
  userId: string,
  serverId: string
): Promise<IAchievement> {
  try {
    // Tenta encontrar o documento existente
    let userAchievements = await Achievement.findOne({ userId, serverId });

    // Se não existir, cria um novo
    if (!userAchievements) {
      userAchievements = new Achievement({
        userId,
        serverId,
        achievements: [],
      });
      await userAchievements.save();
      logger.info(`Created new achievements document for user ${userId} in server ${serverId}`);
    }

    return userAchievements;
  } catch (error) {
    logger.error(
      `Error getting or creating achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Verifica e concede achievements para um usuário
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @param type Tipo de evento
 * @returns Array com os achievements desbloqueados ou null se nenhum
 */
export async function checkAndAwardAchievements(
  userId: string,
  serverId: string,
  type: AchievementEventType
): Promise<string[] | null> {
  try {
    // Recupera ou cria o documento de achievements do usuário
    const userAchievements = await getOrCreateUserAchievements(userId, serverId);

    // Armazena os achievements desbloqueados nesta checagem
    const newlyUnlocked: string[] = [];

    // Filtra achievements relevantes para o tipo de evento
    const relevantAchievements = ACHIEVEMENTS.filter((achievement) =>
      achievement.type.includes(type)
    );

    // Verifica cada achievement do tipo especificado
    for (const achievement of relevantAchievements) {
      // Pula se o achievement já foi desbloqueado
      if (userAchievements.achievements.includes(achievement.id)) {
        continue;
      }

      // Verifica se o usuário cumpre a condição do achievement
      const conditionMet = await achievement.condition(userId, serverId);

      if (conditionMet) {
        // Adiciona o achievement à lista do usuário
        userAchievements.achievements.push(achievement.id);

        // Adiciona à lista de achievements recém-desbloqueados
        newlyUnlocked.push(achievement.id);

        logger.info(`User ${userId} unlocked achievement ${achievement.id} in server ${serverId}`);
      }
    }

    // Salva as alterações se algum achievement foi desbloqueado
    if (newlyUnlocked.length > 0) {
      await userAchievements.save();
      return newlyUnlocked;
    }

    return null;
  } catch (error) {
    logger.error(
      `Error checking achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Busca todos os achievements de um usuário
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @returns Array com os IDs dos achievements ou array vazio
 */
export async function getUserAchievements(userId: string, serverId: string): Promise<string[]> {
  try {
    const userAchievements = await getOrCreateUserAchievements(userId, serverId);
    return userAchievements.achievements;
  } catch (error) {
    logger.error(
      `Error getting achievements for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

/**
 * Converte um ID de achievement para seu título traduzido
 * @param achievementId ID do achievement
 * @returns Título traduzido do achievement
 */
export function getAchievementTitle(achievementId: string): string {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

  if (!achievement) {
    logger.warn(`Unknown achievement ID: ${achievementId}`);
    return achievementId;
  }

  return t(achievement.translationKey);
}

/**
 * Interface para o resultado de progresso de um achievement
 */
export interface AchievementProgress {
  id: string;
  title: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
}

/**
 * Obter o progresso do usuário em todos os achievements
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @returns Array com o progresso de cada achievement
 */
export async function getUserAchievementProgress(
  userId: string,
  serverId: string
): Promise<AchievementProgress[]> {
  try {
    const userAchievements = await getUserAchievements(userId, serverId);
    const progress: AchievementProgress[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const unlocked = userAchievements.includes(achievement.id);
      const achievementProgress: AchievementProgress = {
        id: achievement.id,
        title: getAchievementTitle(achievement.id),
        unlocked,
      };

      // Adiciona informações de progresso para achievements específicos
      if (
        achievement.id === 'zoado_10' ||
        achievement.id === 'zoado_50' ||
        achievement.id === 'zoado_100'
      ) {
        const count = await getCountForUser(userId, serverId);
        let total = 10;

        if (achievement.id === 'zoado_50') total = 50;
        if (achievement.id === 'zoado_100') total = 100;

        achievementProgress.progress = Math.min(count, total);
        achievementProgress.total = total;
      } else if (achievement.id === 'zoador_30') {
        const count = await getUniqueTargetsCount(userId, serverId);
        achievementProgress.progress = Math.min(count, 30);
        achievementProgress.total = 30;
      } else if (achievement.id === 'apelidador_20') {
        const count = await getUniqueTargetsCount(userId, serverId, 'apelido');
        achievementProgress.progress = Math.min(count, 20);
        achievementProgress.total = 20;
      }

      progress.push(achievementProgress);
    }

    return progress;
  } catch (error) {
    logger.error(
      `Error getting achievement progress for user ${userId}:`,
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

export default {
  checkAndAwardAchievements,
  getUserAchievements,
  getAchievementTitle,
  getUserAchievementProgress,
};
