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
 */
export async function incrementUser(userId: string, serverId: string): Promise<void> {
  try {
    // Tenta encontrar um registro existente
    const existingRecord = await Ranking.findOne({ userId, serverId });

    if (existingRecord) {
      // Se existir, incrementa o contador
      existingRecord.count += 1;
      await existingRecord.save();
    } else {
      // Se não existir, cria um novo
      await Ranking.create({
        userId,
        serverId,
        count: 1,
      });
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
