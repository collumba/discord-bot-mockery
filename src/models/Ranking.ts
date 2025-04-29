import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para o documento de Ranking
 */
export interface IRanking extends Document {
  userId: string;
  serverId: string;
  count: number;
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
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt
  }
);

// Cria um índice composto para garantir registros únicos por usuário+servidor
RankingSchema.index({ userId: 1, serverId: 1 }, { unique: true });

// Exporta o modelo
export default mongoose.model<IRanking>('Ranking', RankingSchema, 'rankings');
