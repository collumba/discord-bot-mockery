import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for the Ranking document
 */
export interface IRanking extends Document {
  userId: string;
  serverId: string;
  count: number;
  uniqueTargets: string[];
  uniqueNicknames: string[];
}

/**
 * Schema for the Rankings collection
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
    uniqueNicknames: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create a compound index to ensure unique records per user+server
RankingSchema.index({ userId: 1, serverId: 1 }, { unique: true });

/**
 * MongoDB model for Ranking
 */
export const Ranking = mongoose.model<IRanking>('Ranking', RankingSchema, 'rankings');

export default Ranking;
