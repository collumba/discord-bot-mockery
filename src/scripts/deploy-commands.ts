import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Obter o caminho do diretório atual com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands: any[] = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  
  try {
    // Importar dinamicamente o comando (ESM)
    import(filePath).then((module) => {
      const command = module.default;
      
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`Comando adicionado para deploy: ${command.data.name}`);
      } else {
        console.warn(`[AVISO] O comando em ${filePath} está faltando as propriedades obrigatórias 'data' ou 'execute'.`);
      }
    }).catch(error => {
      console.error(`[ERRO] Houve um erro ao carregar o comando ${filePath}:`, error);
    });
  } catch (error) {
    console.error(`[ERRO] Houve um erro ao importar o comando ${filePath}:`, error);
  }
}

// Aguardar carregamento de todos os comandos antes de fazer o deploy
setTimeout(async () => {
  // Verifica se as variáveis de ambiente estão configuradas
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    console.error('[ERRO] As variáveis de ambiente DISCORD_TOKEN e/ou DISCORD_CLIENT_ID não estão configuradas!');
    process.exit(1);
  }

  const rest = new REST().setToken(token);

  try {
    console.log(`Iniciando deploy de ${commands.length} comandos...`);

    // O método put sobrescreve todos os comandos existentes
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`Deploy de ${Array.isArray(data) ? data.length : 0} comandos realizado com sucesso!`);
  } catch (error) {
    console.error('[ERRO] Houve um erro ao fazer deploy dos comandos:', error);
  }
}, 1000); // Pequeno timeout para garantir que todos os comandos sejam carregados 