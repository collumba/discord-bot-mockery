import { TextChannel, EmbedBuilder, ColorResolvable } from 'discord.js';
import logger from '../utils/logger';
import { t } from './i18nService';
import BOT_CONFIG from '../config/botConfig';

// Tipos de Call to Action
export type CallToType = 'play' | 'chat' | 'event' | 'custom';

// Interface para armazenar os cooldowns
interface CallToCooldown {
  userId: string;
  type: CallToType;
  timestamp: number;
}

// Interface para armazenar agendamentos
export interface CallToSchedule {
  id: string;
  channelId: string;
  type: CallToType;
  customText?: string;
  cronPattern: string;
  enabled: boolean;
  lastRun?: number;
}

// Map para armazenar cooldowns por usuário e tipo
const cooldowns = new Map<string, number>();

// Map para armazenar agendamentos
const schedules = new Map<string, CallToSchedule>();

// Tempo de cooldown em milissegundos (5 minutos)
const COOLDOWN_TIME = 5 * 60 * 1000;

/**
 * Verifica se o usuário está em cooldown para um determinado tipo de CallTo
 * @param userId ID do usuário
 * @param type Tipo de CallTo
 * @returns Verdadeiro se estiver em cooldown
 */
export function isInCooldown(userId: string, type: CallToType): boolean {
  const key = `${userId}_${type}`;
  const lastUsed = cooldowns.get(key);

  if (!lastUsed) return false;

  return Date.now() - lastUsed < COOLDOWN_TIME;
}

/**
 * Obtém o tempo restante de cooldown em segundos
 * @param userId ID do usuário
 * @param type Tipo de CallTo
 * @returns Tempo restante em segundos
 */
export function getRemainingCooldown(userId: string, type: CallToType): number {
  const key = `${userId}_${type}`;
  const lastUsed = cooldowns.get(key);

  if (!lastUsed) return 0;

  const remaining = COOLDOWN_TIME - (Date.now() - lastUsed);
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Registra um novo cooldown para o usuário
 * @param userId ID do usuário
 * @param type Tipo de CallTo
 */
export function registerCooldown(userId: string, type: CallToType): void {
  const key = `${userId}_${type}`;
  cooldowns.set(key, Date.now());
}

/**
 * Inicia um CallTo em um canal específico
 * @param channel Canal de texto para enviar a mensagem
 * @param type Tipo de CallTo (play, chat, event ou custom)
 * @param customText Texto personalizado (apenas para tipo custom)
 * @returns Promise com resultado da operação
 */
export async function startCallTo(
  channel: TextChannel,
  type: CallToType,
  customText?: string
): Promise<boolean> {
  try {
    // Determinando o prefixo do tipo de mensagem
    let prefix = '';
    let phrases: string[] = [];

    switch (type) {
      case 'play':
        prefix = '🎮 '; // Emoji para jogar
        phrases = t('services.callTo.play').split('.,');
        break;
      case 'chat':
        prefix = '💬 '; // Emoji para conversar
        phrases = t('services.callTo.chat').split('.,');
        break;
      case 'event':
        prefix = '🏆 '; // Emoji para evento
        phrases = t('services.callTo.event').split('.,');
        break;
      case 'custom':
        prefix = '📣 '; // Emoji para anúncio
        if (!customText) {
          logger.error('Custom CallTo requires customText parameter');
          return false;
        }
        break;
      default:
        logger.error(`Invalid CallTo type: ${type}`);
        return false;
    }

    // Selecionar frase aleatoriamente ou usar texto personalizado
    const phrase =
      type === 'custom'
        ? customText || 'Custom message' // Garantir que nunca será undefined
        : phrases[Math.floor(Math.random() * phrases.length)];

    // Criar e enviar a mensagem de texto simples
    const message = `${prefix}${phrase}`;
    await channel.send(message);

    logger.info(`CallTo sent to channel ${channel.name} (${channel.id}) with type ${type}`);
    return true;
  } catch (error) {
    logger.error(`Error sending CallTo: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Limpa cooldowns expirados para evitar vazamentos de memória
 */
export function cleanupCooldowns(): void {
  const now = Date.now();
  for (const [key, timestamp] of cooldowns.entries()) {
    if (now - timestamp >= COOLDOWN_TIME) {
      cooldowns.delete(key);
    }
  }
}

/**
 * Cria um novo agendamento de CallTo
 * @param channelId ID do canal para enviar a mensagem
 * @param type Tipo de CallTo
 * @param cronPattern Padrão cron para agendamento (ex: '0 0 * * *' para diariamente à meia-noite)
 * @param customText Texto personalizado (apenas para tipo custom)
 * @returns ID do agendamento criado ou null em caso de erro
 */
export function createSchedule(
  channelId: string,
  type: CallToType,
  cronPattern: string,
  customText?: string
): string | null {
  try {
    // Validar tipo
    if (type === 'custom' && !customText) {
      logger.error('Custom CallTo schedule requires customText parameter');
      return null;
    }

    // Gerar ID único
    const id = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar objeto de agendamento
    const schedule: CallToSchedule = {
      id,
      channelId,
      type,
      cronPattern,
      enabled: true,
      customText,
    };

    // Armazenar agendamento
    schedules.set(id, schedule);

    logger.info(`Created new CallTo schedule: ${JSON.stringify(schedule)}`);
    return id;
  } catch (error) {
    logger.error(
      `Error creating CallTo schedule: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Remove um agendamento de CallTo
 * @param scheduleId ID do agendamento a ser removido
 * @returns Verdadeiro se o agendamento foi removido com sucesso
 */
export function removeSchedule(scheduleId: string): boolean {
  if (!schedules.has(scheduleId)) {
    logger.warn(`Schedule with ID ${scheduleId} not found`);
    return false;
  }

  schedules.delete(scheduleId);
  logger.info(`Removed CallTo schedule with ID ${scheduleId}`);
  return true;
}

/**
 * Ativa ou desativa um agendamento
 * @param scheduleId ID do agendamento
 * @param enabled Status de ativação
 * @returns Verdadeiro se a operação foi bem-sucedida
 */
export function setScheduleEnabled(scheduleId: string, enabled: boolean): boolean {
  const schedule = schedules.get(scheduleId);

  if (!schedule) {
    logger.warn(`Schedule with ID ${scheduleId} not found`);
    return false;
  }

  schedule.enabled = enabled;
  schedules.set(scheduleId, schedule);

  logger.info(`Schedule ${scheduleId} is now ${enabled ? 'enabled' : 'disabled'}`);
  return true;
}

/**
 * Obtém todos os agendamentos
 * @returns Array com todos os agendamentos
 */
export function getAllSchedules(): CallToSchedule[] {
  return Array.from(schedules.values());
}

/**
 * Obtém um agendamento específico
 * @param scheduleId ID do agendamento
 * @returns Objeto de agendamento ou null se não encontrado
 */
export function getSchedule(scheduleId: string): CallToSchedule | null {
  return schedules.get(scheduleId) || null;
}

/**
 * Atualiza o timestamp da última execução de um agendamento
 * @param scheduleId ID do agendamento
 */
export function updateScheduleLastRun(scheduleId: string): void {
  const schedule = schedules.get(scheduleId);

  if (schedule) {
    schedule.lastRun = Date.now();
    schedules.set(scheduleId, schedule);
  }
}

// Exportar como objeto e como funções individuais
export default {
  startCallTo,
  isInCooldown,
  getRemainingCooldown,
  registerCooldown,
  cleanupCooldowns,
  // Funções de agendamento
  createSchedule,
  removeSchedule,
  setScheduleEnabled,
  getAllSchedules,
  getSchedule,
  updateScheduleLastRun,
};
