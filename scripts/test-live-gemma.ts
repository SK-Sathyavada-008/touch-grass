import dotenv from 'dotenv';
dotenv.config();

import { createGemmaProvider } from '../server/ai/providerFactory.js';

async function testLiveGemma() {
  console.log('Testing live Gemma API connection with configured key...');
  const provider = createGemmaProvider();
  console.log('Provider created:', provider.name, 'isMock:', provider.isMock);

  try {
    const adventure = await provider.generateTenMinuteAdventure({ timeMinutes: 10, groupType: 'solo', vibe: 'sunshine' });
    console.log('\n✅ SUCCESS: Live Gemma returned structured adventure:');
    console.log('Title:', adventure.title);
    console.log('Description:', adventure.description);
    console.log('Quests:', adventure.quests.map(q => q.text));
    console.log('Phone Away:', adventure.phoneAwayInstruction);
  } catch (err) {
    console.error('\n❌ Live Gemma call failed:', (err as Error).message);
  }
}

testLiveGemma();
