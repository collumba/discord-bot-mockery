import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for the GuildConfig document
 */
export interface IGuildConfig extends Document {
  guildId: string;
  channelId: string;
  allowedRoleIds: string[];
}

/**
 * Schema for the GuildConfig collection
 */
const GuildConfigSchema = new Schema<IGuildConfig>(
  {
    guildId: {
      type: String,
      required: true,
      unique: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    allowedRoleIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * MongoDB model for GuildConfig
 */
export const GuildConfig = mongoose.model<IGuildConfig>(
  'GuildConfig',
  GuildConfigSchema,
  'guildConfigs'
);

export default GuildConfig;
