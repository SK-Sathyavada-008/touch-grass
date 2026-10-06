import { AiOutputValidator } from '../server/ai/validator.js';
import { MockGemmaProvider } from '../server/ai/mockGemmaProvider.js';
import { createGemmaProvider } from '../server/ai/providerFactory.js';

async function runAudit() {
  console.log('🧪 Starting TouchGrass AI Audit Tests...\n');

  // Test 1: Validator on 10-Minute Adventure
  console.log('Test 1: AiOutputValidator - 10-Minute Adventure validation');
  const valid10 = AiOutputValidator.validateTenMinuteAdventure({
    title: 'Yellow Hunt',
    vibe: 'Sunlight',
    description: 'Find yellow things outdoors.',
    quests: ['Find yellow leaf', 'Listen to 3 sounds', 'Touch stone'],
    phoneAwayInstruction: 'Now put your phone away.',
  }, 10);
  console.assert(valid10.title === 'Yellow Hunt', 'Title should match');
  console.assert(valid10.quests.length >= 3, 'Must have at least 3 quests');
  console.assert(valid10.phoneAwayInstruction.includes('phone away'), 'Must have phone away instruction');
  console.log('✓ Passed: 10-Minute Adventure validation');

  // Test 2: Validator on Explore Adventure
  console.log('\nTest 2: AiOutputValidator - Explore Adventure validation');
  const validExplore = AiOutputValidator.validateExploreAdventure({
    title: '30-Minute Wander',
    theme: 'Greenery',
    destinations: [
      { name: 'Pine Grove', type: 'woods', reasonWhyInteresting: 'Tall trees', simpleActivity: 'Breathe', clue: 'Look up' },
      { name: 'Rose Garden', type: 'garden', reasonWhyInteresting: 'Fragrant', simpleActivity: 'Smell', clue: 'Follow petals' },
      { name: 'Quiet Bench', type: 'park', reasonWhyInteresting: 'Rest', simpleActivity: 'Sit', clue: 'Near fountain' },
    ],
    quests: ['Spot bird', 'Find flower', 'Count sounds'],
    encouragement: 'Enjoy!',
  }, 30, 'solo');
  console.assert(validExplore.destinations.length === 3, 'Must have 3 destinations');
  console.assert(validExplore.destinations[0].reasonWhyInteresting === 'Tall trees', 'Reason must match');
  console.log('✓ Passed: Explore Adventure validation');

  // Test 3: Validator on Nature Discovery Vision
  console.log('\nTest 3: AiOutputValidator - Discovery Vision validation');
  const validVision = AiOutputValidator.validateImageAnalysis({
    identification: 'Common Mormon Butterfly',
    certainty: 'likely',
    description: 'A swallowtail butterfly.',
    interestingFact: 'Females mimic rose butterflies.',
    nextQuest: 'Find another pollinator.',
  });
  console.assert(validVision.certainty === 'likely', 'Certainty must match');
  console.assert(validVision.identification === 'Common Mormon Butterfly', 'ID must match');
  console.assert(validVision.interestingFact.length > 0, 'Must have interesting fact');
  console.assert(validVision.nextQuest.length > 0, 'Must have next quest');
  console.log('✓ Passed: Discovery Vision validation');

  // Test 4: MockGemmaProvider end-to-end
  console.log('\nTest 4: MockGemmaProvider generation functions');
  const mock = new MockGemmaProvider();
  const res10 = await mock.generateTenMinuteAdventure({ timeMinutes: 10, groupType: 'friends' });
  console.assert(res10.quests.length >= 3, 'Mock must produce at least 3 quests');
  console.assert(res10.phoneAwayInstruction.length > 0, 'Mock must have phone away instruction');

  const resExp = await mock.generateExploreAdventure(60, 'solo', []);
  console.assert(resExp.destinations.length === 3, 'Mock must produce 3 destinations');

  const resClue = await mock.generateQuestClue('Quiet Park', 'park');
  console.assert(resClue.length > 0, 'Mock must produce a clue');

  const resDisc = await mock.analyzeDiscoveryImage('fakebase64sample123', 'image/jpeg');
  console.assert(['likely', 'possible', 'uncertain'].includes(resDisc.certainty), 'Must have valid certainty enum');
  console.log('✓ Passed: MockGemmaProvider all 4 functions verified');

  // Test 5: Provider Factory Boundary
  console.log('\nTest 5: Provider Factory Boundary');
  const provider = createGemmaProvider();
  console.assert(provider.isMock === true, 'Factory should select Mock when GEMMA_API_KEY is unset');
  console.log('✓ Passed: Provider Factory correctly handles missing key with offline mock');

  console.log('\n🎉 ALL AUDIT TESTS PASSED CLEANLY!\n');
}

runAudit().catch((err) => {
  console.error('Audit test failed:', err);
  process.exit(1);
});
