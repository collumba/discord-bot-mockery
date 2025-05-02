import { ChatInputCommandInteraction, User } from 'discord.js';
import { canExecute } from './canExecuteCommand';
import { isInCooldown, registerCooldown, getRemainingCooldown } from '../services/cooldownService';
import { t } from '../services/i18nService';
import BOT_CONFIG from '../config/botConfig';
import { getReliableRoast } from '../services/roastAI';
import embedsService from '../services/embedsService';

/**
 * Type for the result of a permission check
 */
export type PermissionResult = { success: true } | { success: false; response: any };

/**
 * Type for the result of a cooldown check
 */
export type CooldownResult = { success: true } | { success: false; response: any };

/**
 * Type for the result of a user check
 */
export type UserCheckResult = { success: true; user: User } | { success: false; response: any };

/**
 * Type for the result of AI content generation
 */
export type AiGenerationResult =
  | { success: true; content: string }
  | { success: false; error: string };

/**
 * Valid command keys that have context in BOT_CONFIG.COMMANDS
 */
export type CommandContextKey =
  | 'HUMILIATE'
  | 'MOCK'
  | 'NICKNAME'
  | 'RANDOMPHRASE'
  | 'CALLTO_PLAY'
  | 'CALLTO_CHAT'
  | 'CALLTO_EVENT'
  | 'CALLTO_CUSTOM';

/**
 * Handles permission checking for commands.
 * @param interaction The command interaction
 * @returns A result object with success flag and response if needed
 */
export function checkPermissions(interaction: ChatInputCommandInteraction): PermissionResult {
  if (!canExecute(interaction)) {
    return {
      success: false,
      response: {
        content: t('errors.permission_denied'),
        ephemeral: true,
      },
    };
  }

  return { success: true };
}

/**
 * Handles cooldown checking for commands.
 * @param interaction The command interaction
 * @param commandName The name of the command for cooldown tracking
 * @returns A result object with success flag and response if needed
 */
export function checkCooldown(
  interaction: ChatInputCommandInteraction,
  commandName: string
): CooldownResult {
  if (isInCooldown(interaction.user.id, commandName)) {
    const remainingTime = getRemainingCooldown(interaction.user.id, commandName);
    const embed = embedsService.createCooldownEmbed(commandName, remainingTime);

    return {
      success: false,
      response: { embeds: [embed], ephemeral: true },
    };
  }

  return { success: true };
}

/**
 * Registers a cooldown for a user after successful command execution.
 * @param userId The user's ID
 * @param commandName The command name for tracking
 * @param seconds Cooldown duration in seconds
 */
export function applyCooldown(userId: string, commandName: string, seconds: number): void {
  registerCooldown(userId, commandName, seconds);
}

/**
 * Validates a target user from command options.
 * @param interaction The command interaction
 * @param optionName The name of the user option (default: "user")
 * @param allowSelf Whether to allow targeting self (default: false)
 * @param allowBots Whether to allow targeting bots (default: false)
 * @returns A result object with success flag, user if successful, or response if failed
 */
export function validateTargetUser(
  interaction: ChatInputCommandInteraction,
  optionName: string = 'user',
  allowSelf: boolean = false,
  allowBots: boolean = false
): UserCheckResult {
  const user = interaction.options.getUser(optionName);

  if (!user) {
    return {
      success: false,
      response: {
        content: t('errors.user_not_found'),
        ephemeral: true,
      },
    };
  }

  // Check if user is targeting self and it's not allowed
  if (!allowSelf && user.id === interaction.user.id) {
    return {
      success: false,
      response: {
        content: t(`commands.${interaction.commandName}.error.self_target`),
        ephemeral: true,
      },
    };
  }

  // Check if user is targeting a bot and it's not allowed
  if (!allowBots) {
    if (user.bot || user.id === interaction.client.user?.id) {
      return {
        success: false,
        response: {
          content: t('errors.no_valid_members'),
          ephemeral: true,
        },
      };
    }
  }

  return { success: true, user };
}

/**
 * Safely gets the context for a command from BOT_CONFIG
 * @param contextKey The key in BOT_CONFIG.COMMANDS
 * @returns The context string or undefined if not found
 */
function getCommandContext(contextKey: string): string | undefined {
  // For standard commands
  if (contextKey in BOT_CONFIG.COMMANDS) {
    return (BOT_CONFIG.COMMANDS as any)[contextKey].CONTEXT;
  }

  // For CALLTO subcommands
  if (contextKey.startsWith('CALLTO_')) {
    const callType = contextKey.replace('CALLTO_', '').toLowerCase();
    if (callType in BOT_CONFIG.COMMANDS.CALLTO) {
      return (BOT_CONFIG.COMMANDS.CALLTO as any)[callType].CONTEXT;
    }
  }

  return undefined;
}

/**
 * Generates AI content using the roastAI service.
 * @param contextKey The key in BOT_CONFIG.COMMANDS for context
 * @param replacements Key-value pairs for placeholders in the context
 * @returns A promise resolving to the generated content or rejection with error
 */
export async function generateAiContent(
  contextKey: string,
  replacements: Record<string, string> = {}
): Promise<AiGenerationResult> {
  try {
    // Get the context from config
    const context = getCommandContext(contextKey.toUpperCase());

    if (!context) {
      return {
        success: false,
        error: `Invalid context key: ${contextKey}`,
      };
    }

    // Apply replacements
    let finalContext = context;
    Object.entries(replacements).forEach(([key, value]) => {
      finalContext = finalContext.replace(key, value);
    });

    // Generate content
    const content = await getReliableRoast(finalContext);

    if (!content) {
      return {
        success: false,
        error: 'Failed to generate AI content',
      };
    }

    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during AI generation',
    };
  }
}

export const CommandHandler = {
  checkPermissions,
  checkCooldown,
  applyCooldown,
  validateTargetUser,
  generateAiContent,
  embedsService, // Expose the embeds service through the CommandHandler for convenience
};

export default CommandHandler;
