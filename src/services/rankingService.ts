// src/services/rankingService.ts
import Ranking, { IRanking } from '../models/Ranking';
import logger from '../utils/logger';

// Interface para o formato do ranking
interface RankingItem {
  userId: string;
  count: number;
}

/**
 * Incrementa a contagem de zoeiras para um usuário em um servidor específico
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @param targetId ID opcional do alvo (para rastrear alvos únicos)
 * @param actionType Tipo de ação (padrão: 'zoar')
 */
export async function incrementUser(
  userId: string,
  serverId: string,
  targetId?: string,
  actionType: 'zoar' | 'apelido' = 'zoar'
): Promise<void> {
  try {
    // Tenta encontrar um registro existente
    const existingRecord = await Ranking.findOne({ userId, serverId });

    if (existingRecord) {
      // Se existir, incrementa o contador
      existingRecord.count += 1;

      // Se temos um targetId, adicionamos aos alvos únicos
      if (targetId) {
        // Inicializa arrays se não existirem
        if (!existingRecord.uniqueTargets) existingRecord.uniqueTargets = [];
        if (!existingRecord.uniqueApelidos) existingRecord.uniqueApelidos = [];

        // Adiciona o targetId ao array correspondente se ainda não estiver lá
        if (actionType === 'zoar' && !existingRecord.uniqueTargets.includes(targetId)) {
          existingRecord.uniqueTargets.push(targetId);
        } else if (actionType === 'apelido' && !existingRecord.uniqueApelidos.includes(targetId)) {
          existingRecord.uniqueApelidos.push(targetId);
        }
      }

      await existingRecord.save();
    } else {
      // Se não existir, cria um novo
      const newRecord: any = {
        userId,
        serverId,
        count: 1,
      };

      // Adiciona o targetId aos arrays se fornecido
      if (targetId) {
        if (actionType === 'zoar') {
          newRecord.uniqueTargets = [targetId];
        } else if (actionType === 'apelido') {
          newRecord.uniqueApelidos = [targetId];
        }
      }

      await Ranking.create(newRecord);
    }
  } catch (error) {
    logger.error(`Erro ao incrementar contagem para usuário ${userId}:`, error as Error);
    // Garantimos que o erro não vai quebrar a experiência
  }
}

/**
 * Retorna o ranking dos usuários mais zoados em um servidor específico
 * @param serverId ID do servidor
 * @param limit Número máximo de resultados (padrão: 5)
 * @returns Array de objetos com userId e count
 */
export async function getTopRanking(serverId: string, limit = 5): Promise<RankingItem[]> {
  try {
    // Busca os registros ordenados por count (decrescente)
    const rankings = await Ranking.find({ serverId })
      .sort({ count: -1 })
      .limit(limit)
      .select('userId count')
      .lean();

    // Transforma para o formato esperado pelos comandos
    return rankings.map((doc: any) => ({
      userId: doc.userId,
      count: doc.count,
    }));
  } catch (error) {
    logger.error(`Erro ao buscar ranking para o servidor ${serverId}:`, error as Error);
    // Em caso de erro, retorna array vazio
    return [];
  }
}

/**
 * Compatibilidade com formato anterior (para comandos antigos)
 * @param serverId ID do servidor
 * @param limit Número máximo de resultados
 * @returns Array de tuplas [userId, count]
 */
export async function getTopRankingLegacy(
  serverId: string,
  limit = 5
): Promise<Array<[string, number]>> {
  try {
    const rankings = await getTopRanking(serverId, limit);
    // Converte para o formato anterior [userId, count]
    return rankings.map((r) => [r.userId, r.count]);
  } catch (error) {
    logger.error('Erro ao buscar ranking legado:', error as Error);
    return [];
  }
}

/**
 * Obtém a contagem de zoadas que um usuário recebeu
 * @param userId ID do usuário
 * @param serverId ID do servidor
 * @returns Número de vezes que o usuário foi zoado
 */
export async function getCountForUser(userId: string, serverId: string): Promise<number> {
  try {
    const record = await Ranking.findOne({ userId, serverId }).select('count').lean();
    return record?.count || 0;
  } catch (error) {
    logger.error(`Erro ao buscar contagem para usuário ${userId}:`, error as Error);
    return 0;
  }
}

/**
 * Obtém o número de alvos únicos que um usuário zoou ou apelidou
 * @param userId ID do usuário que fez a ação
 * @param serverId ID do servidor
 * @param actionType Tipo de ação (zoar ou apelido)
 * @returns Número de alvos únicos
 */
export async function getUniqueTargetsCount(
  userId: string,
  serverId: string,
  actionType: 'zoar' | 'apelido' = 'zoar'
): Promise<number> {
  try {
    const field = actionType === 'zoar' ? 'uniqueTargets' : 'uniqueApelidos';
    const record = await Ranking.findOne({ userId, serverId }).select(field).lean();

    if (!record || !record[field]) {
      return 0;
    }

    return record[field].length;
  } catch (error) {
    logger.error(`Erro ao buscar alvos únicos para usuário ${userId}:`, error as Error);
    return 0;
  }
}

export default {
  incrementUser,
  getTopRanking,
  getTopRankingLegacy,
  getCountForUser,
  getUniqueTargetsCount,
};
