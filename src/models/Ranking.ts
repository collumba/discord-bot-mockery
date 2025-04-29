import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para o documento de Ranking
 */
export interface IRanking extends Document {
  userId: string;
  serverId: string;
  count: number;
  uniqueTargets: string[];
  uniqueApelidos: string[];
}

/**
 * Schema para a coleção de Rankings
 */
const RankingSchema = new Schema<IRanking>(
  {
    userId: {
      type: String,
      required: true,
    },
    serverId: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    uniqueTargets: {
      type: [String],
      default: [],
    },
    uniqueApelidos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt
  }
);

// Cria um índice composto para garantir registros únicos por usuário+servidor
RankingSchema.index({ userId: 1, serverId: 1 }, { unique: true });

/**
 * Modelo do MongoDB para Ranking
 */
export const Ranking = mongoose.model<IRanking>('Ranking', RankingSchema, 'rankings');

export default Ranking;
