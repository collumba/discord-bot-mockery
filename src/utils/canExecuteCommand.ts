// src/utils/canExecuteCommand.ts
import { ChatInputCommandInteraction } from 'discord.js';

const allowedRoles = ['Zoadores', 'Admins']; // Nome das roles que podem usar os comandos

export function canExecute(interaction: ChatInputCommandInteraction) {
  if (!interaction.member || !('roles' in interaction.member)) {
    return false;
  }

  const roles = interaction.member.roles as any;
  const hasPermission = roles.cache.some((role: any) => allowedRoles.includes(role.name));

  return hasPermission;
}
