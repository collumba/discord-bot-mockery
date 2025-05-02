// src/utils/canExecuteCommand.ts
import { ChatInputCommandInteraction } from 'discord.js';
import { getAllowedRoleIds } from '../services/guildConfigService';
import logger from './logger';

// Default allowed roles in case no roles are configured
const defaultAllowedRoles = ['Zoadores', 'Admins'];

export async function canExecute(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (!interaction.member || !('roles' in interaction.member)) {
    return false;
  }

  if (!interaction.guildId) {
    return false;
  }

  const roles = interaction.member.roles as any;

  // Check if roles and roles.cache exist before trying to use the 'some' method
  if (!roles || !roles.cache) {
    return false;
  }

  // Get configured role IDs from database
  const allowedRoleIds = await getAllowedRoleIds(interaction.guildId);

  // If no roles configured, use default role names
  if (allowedRoleIds.length === 0) {
    const hasPermissionByName = roles.cache.some((role: any) =>
      defaultAllowedRoles.includes(role.name)
    );

    return hasPermissionByName;
  }

  // Check if the user has any of the configured role IDs
  const hasPermissionById = roles.cache.some((role: any) => allowedRoleIds.includes(role.id));

  return hasPermissionById;
}
