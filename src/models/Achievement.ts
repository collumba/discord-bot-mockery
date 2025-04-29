import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface para o documento de Achievement no MongoDB
 */
export interface IAchievement extends Document {
  userId: string;
  serverId: string;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema do MongoDB para Achievement
 */
const AchievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: String,
      required: true,
    },
    serverId: {
      type: String,
      required: true,
    },
    achievements: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Índice composto para buscar rapidamente achievements de um usuário em um servidor
AchievementSchema.index({ userId: 1, serverId: 1 }, { unique: true });

/**
 * Modelo do MongoDB para Achievement
 */
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default Achievement;
