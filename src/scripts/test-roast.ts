import dotenv from 'dotenv';
import { getDynamicRoast, getReliableRoast } from '../services/roastAI';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

// Check/configure the LM Studio API URL
const lmStudioUrl = process.env.LMSTUDIO_API_URL || 'http://localhost:1234/v1';
console.log(`Connecting to LM Studio at: ${lmStudioUrl}`);
console.log('Ensure LM Studio is running and the API server is active.');

async function testRoastAI() {
  try {
    console.log('\nTesting getDynamicRoast...');
    const testTrigger = 'Eu sou muito bom em jogos de RPG';

    console.log(`Trigger: "${testTrigger}"`);
    console.log('Gerando resposta...');

    // Test the getDynamicRoast
    const dynamicRoast = await getDynamicRoast(testTrigger);
    console.log(`getDynamicRoast response: "${dynamicRoast}"`);

    // Test the getReliableRoast
    console.log('\nTesting getReliableRoast...');
    const reliableRoast = await getReliableRoast(testTrigger);
    console.log(`getReliableRoast response: "${reliableRoast}"`);

    console.log('\nTests completed successfully!');
  } catch (error) {
    logger.error(
      `Error during the test: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Run the tests
testRoastAI();
