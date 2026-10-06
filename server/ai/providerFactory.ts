import { IGemmaProvider } from './types.js';
import { MockGemmaProvider } from './mockGemmaProvider.js';
import { RealGemmaProvider } from './realGemmaProvider.js';

export function createGemmaProvider(): IGemmaProvider {
  const apiKey = process.env.GEMMA_API_KEY?.trim();
  const model = process.env.GEMMA_MODEL?.trim() || 'gemma-2-9b-it';
  const visionModel = process.env.GEMMA_VISION_MODEL?.trim() || 'paligemma-3b-mix-448';
  const baseUrl = process.env.GEMMA_API_BASE_URL?.trim();

  if (!apiKey) {
    console.log('\n======================================================');
    console.log('🌿 [TouchGrass AI] Notice: GEMMA_API_KEY is not configured.');
    console.log('🌱 Using MockGemmaProvider (Deterministic offline mode).');
    console.log('✨ All adventures and vision identifications will simulate real Gemma output.');
    console.log('======================================================\n');
    return new MockGemmaProvider();
  }

  console.log('\n======================================================');
  console.log(`🌿 [TouchGrass AI] Initializing RealGemmaProvider`);
  console.log(`🤖 Model: ${model}`);
  console.log(`👁️ Vision Model: ${visionModel}`);
  console.log(`🌐 Base URL: ${baseUrl || 'default Google Generative AI / OpenAI compatible'}`);
  console.log('======================================================\n');

  return new RealGemmaProvider({
    apiKey,
    model,
    visionModel,
    baseUrl,
  });
}
