import logger from '../utils/logger';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

// Carregar variáveis de ambiente se ainda não estiverem carregadas
if (!process.env.HF_TOKEN) {
  dotenv.config();
}

// Token de autenticação (obrigatório)
const HF_TOKEN = process.env.HF_TOKEN;

// Modelo a ser usado
const MODEL = 'HuggingFaceH4/zephyr-7b-beta';

// Cliente de inferência
const client = HF_TOKEN ? new InferenceClient(HF_TOKEN) : null;

/**
 * Limpa a resposta da API removendo o prompt original se for ecoado de volta
 * @param response Texto gerado pela API
 * @param prompt Prompt original enviado
 * @returns Texto limpo
 */
function cleanResponse(response: string, prompt: string): string {
  // Remove o prompt se ele estiver no início da resposta
  if (response.startsWith(prompt)) {
    return response.substring(prompt.length).trim();
  }

  // Procura por padrões comuns de resposta do assistente
  const patterns = [
    /.*?:\s*(.*)/i, // Matches "Assistant: [response]"
    /.*?resposta:?\s*(.*)/i, // Matches "Resposta: [response]"
    /.*?Soberaninha:?\s*(.*)/i, // Matches "Soberaninha: [response]"
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return response.trim();
}

/**
 * Obtém uma zombaria dinâmica gerada pela IA
 * @param trigger Texto que disparou a zombaria (mensagem, atividade, etc.)
 * @returns Promessa que resolve para a zombaria gerada
 */
export async function getDynamicRoast(trigger: string): Promise<string> {
  // Verificar se o token do Hugging Face está disponível
  if (!HF_TOKEN || !client) {
    logger.error('HF_TOKEN não encontrado nas variáveis de ambiente');
    return 'Você não merece nem zoeira.';
  }

  try {
    // Construir o prompt para a IA
    const prompt = `Você é a Soberaninha, uma adolescente debochada, sarcástica e gamer. 
Alguém disse: "${trigger}" no Discord. 
Responda com uma frase engraçada, provocativa, em português. Só uma frase.`;

    // Fazer a requisição para a API usando o cliente de inferência
    const chatCompletion = await client.chatCompletion({
      provider: 'hf-inference',
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 512,
    });

    const generatedText = chatCompletion.choices[0].message.content;

    // Limpar e verificar a resposta
    if (!generatedText) {
      throw new Error('Resposta vazia da API');
    }

    const cleanedResponse = cleanResponse(generatedText, prompt);

    // Verificar se a resposta limpa é válida
    if (!cleanedResponse || cleanedResponse.length < 3) {
      throw new Error('Resposta limpa inválida');
    }

    return cleanedResponse;
  } catch (error) {
    // Registrar o erro e retornar uma frase de fallback
    logger.error(
      `Erro ao obter zombaria dinâmica: ${error instanceof Error ? error.message : String(error)}`
    );
    return 'Você não merece nem zoeira.';
  }
}

// Frases de fallback para casos em que a API falha
export const FALLBACK_ROASTS = [
  'Você não merece nem zoeira.',
  'Nossa, nem vou zoar... ia ser muito fácil.',
  'Tá querendo atenção? Volta outro dia.',
  'Nem a IA quer zoar você, triste.',
  'Economizando processamento pra quem merece.',
  'Internet lenta demais pra zoar você agora.',
  'Desculpa, tô ocupada zoando alguém que vale a pena.',
  'Error 404: Zoeira not found.',
  'Tente novamente quando for mais interessante.',
  'Zzzzz... que? Ah, nem vi que você estava aí.',
];

/**
 * Obtém uma zombaria dinâmica com fallback em caso de erro
 * @param trigger Texto que disparou a zombaria
 * @returns Promessa que resolve para a zombaria gerada ou uma frase de fallback
 */
export async function getReliableRoast(trigger: string): Promise<string> {
  try {
    // Tentar obter uma zombaria dinâmica
    return await getDynamicRoast(trigger);
  } catch (error) {
    // Em caso de erro, retornar uma frase de fallback aleatória
    const randomIndex = Math.floor(Math.random() * FALLBACK_ROASTS.length);
    return FALLBACK_ROASTS[randomIndex];
  }
}

export default {
  getDynamicRoast,
  getReliableRoast,
};
