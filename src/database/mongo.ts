import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Conecta ao MongoDB usando a URI fornecida no .env
 */
export async function connectMongo(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI não encontrada no arquivo .env');
    }

    await mongoose.connect(mongoUri);

    logger.info('Conectado ao MongoDB com sucesso');

    // Eventos de conexão
    mongoose.connection.on('error', (err) => {
      logger.error(`Erro na conexão MongoDB: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });

    // Tratamento para encerramento do processo
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Conexão MongoDB encerrada devido ao término da aplicação');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Falha ao conectar ao MongoDB', error as Error);
    throw error;
  }
}
