import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for the Achievement document in MongoDB
 */
export interface IAchievement extends Document {
  userId: string;
  serverId: string;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for the Achievement document in MongoDB
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

// Composite index to quickly search for achievements of a user in a server
AchievementSchema.index({ userId: 1, serverId: 1 }, { unique: true });

/**
 * MongoDB model for Achievement
 */
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default Achievement;
