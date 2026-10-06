import { IGemmaProvider, NearbyPlace } from './types.js';
import { TenMinuteAdventure, ExploreAdventure, ImageAnalysisResult, QuestItem, TenMinuteAdventureParams } from '../types.js';
import { AiOutputValidator } from './validator.js';

export class MockGemmaProvider implements IGemmaProvider {
  readonly name = 'MockGemmaProvider';
  readonly isMock = true;

  private tenMinuteTemplates = [
    {
      title: 'Yellow Hunt',
      vibe: 'Sun-Seeker',
      description: 'Take a short walk and find three things that are yellow.',
      quests: [
        'Find something naturally yellow (a leaf, petal, or lichen)',
        'Find something living smaller than your thumbnail',
        'Stop, close your eyes, and listen for 3 different sounds',
        'Take one mental photo of something you normally ignore',
      ],
      phoneAwayInstruction: 'Now put your phone away. The yellow wonders are right outside. 🌱',
    },
    {
      title: 'Texture Safari',
      vibe: 'Tactile Explorer',
      description: 'Nature is not flat glass like your phone screen. Go touch three completely different textures.',
      quests: [
        'Gently touch rough tree bark with your fingertips',
        'Find a smooth pebble or a cool stone in the shade',
        'Feel the softness of a fresh green leaf or patch of moss',
        'Look up: find the highest cloud or branch currently visible',
      ],
      phoneAwayInstruction: 'Pocket your phone and let your hands explore the real world. 🌿',
    },
    {
      title: 'The Sky Observer',
      vibe: 'Quiet Breeze',
      description: 'We spend all day staring down at screens. Spend the next ten minutes looking up and outward.',
      quests: [
        'Spot a bird perched or gliding overhead',
        'Find a cloud or branch silhouette that looks like an animal',
        'Feel the direction the breeze is blowing across your face',
        'Take one deep, slow breath and notice the smell of fresh air',
      ],
      phoneAwayInstruction: 'Now put your phone away. Look up at the open sky. ☁️',
    },
    {
      title: 'Micro Jungle',
      vibe: 'Curious Botanist',
      description: 'Kneel down by the edge of any garden or patch of grass and inspect the miniature forest underfoot.',
      quests: [
        'Count 3 distinct species of grass, clover, or weeds',
        'Spot an insect going about its busy afternoon work',
        'Find a leaf with drops of moisture or tiny intricate veins',
        'Notice an interesting shadow cast by a twig or blade of grass',
      ],
      phoneAwayInstruction: 'Put your screen away. A whole wild universe is at your feet. 🐜',
    },
  ];

  async generateTenMinuteAdventure(params?: TenMinuteAdventureParams | string): Promise<TenMinuteAdventure> {
    const vibe = typeof params === 'string' ? params : params?.vibe;
    const duration = typeof params === 'object' && params?.timeMinutes ? params.timeMinutes : 10;
    const isFriends = typeof params === 'object' && params?.groupType === 'friends';

    const index = Math.floor(Math.random() * this.tenMinuteTemplates.length);
    const chosen = this.tenMinuteTemplates[index];

    const rawQuests: string[] = isFriends
      ? [
          ...chosen.quests.slice(0, 3),
          'Point out one interesting plant or tree shape to your companion without speaking first',
        ]
      : chosen.quests;

    const quests: QuestItem[] = rawQuests.map((text, i) => ({
      id: `quest-${Date.now()}-${i}`,
      text,
      completed: false,
      category: i === 0 ? 'sight' : i === 1 ? 'sight' : i === 2 ? 'sound' : 'touch',
    }));

    return AiOutputValidator.validateTenMinuteAdventure({
      title: chosen.title,
      vibe: vibe || chosen.vibe,
      description: chosen.description,
      durationMinutes: duration,
      quests,
      phoneAwayInstruction: chosen.phoneAwayInstruction,
      closingEncouragement: chosen.phoneAwayInstruction,
    }, duration);
  }

  async generateExploreAdventure(
    timeMinutes: number,
    groupType: 'solo' | 'friends',
    nearbyPlaces: NearbyPlace[]
  ): Promise<ExploreAdventure> {
    const places = nearbyPlaces.length > 0 ? nearbyPlaces.slice(0, 3) : [
      { name: 'Sunlit Neighborhood Park', type: 'park', distance: '300m away' },
      { name: 'Community Garden or Flowerbed', type: 'garden', distance: '600m away' },
      { name: 'Quiet Tree Canopy or Open Pathway', type: 'nature', distance: '850m away' },
    ];

    const destinations = places.map((place, idx) => ({
      id: `dest-${Date.now()}-${idx}`,
      name: place.name,
      type: place.type,
      distance: place.distance || `${(idx + 1) * 300}m away`,
      reasonWhyInteresting: idx === 0
        ? 'A peaceful green refuge with established trees and open sky.'
        : idx === 1
        ? 'A hub of pollinator activity where flowering plants flourish.'
        : 'A tranquil stretch of foliage where urban sounds fade.',
      simpleActivity: idx === 0
        ? 'Walk along the outer lawn and count 3 different birds or squirrels.'
        : idx === 1
        ? 'Observe two distinct petal shapes and look for visiting bumblebees.'
        : 'Find a comfortable stone or bench, close your eyes, and listen for 60 seconds.',
      clue: this.generateClueForPlace(place.name, place.type, idx),
      revealed: false,
      coordinates: place.lat && place.lon ? { lat: place.lat, lon: place.lon } : undefined,
    }));

    const quests: QuestItem[] = [
      {
        id: `exp-q-1`,
        text: groupType === 'friends' ? 'Spot 3 different kinds of birds and point them out together' : 'Spot 3 different kinds of birds in the foliage',
        completed: false,
        category: 'sight',
      },
      {
        id: `exp-q-2`,
        text: 'Find 2 different wildflowers growing wild along the path',
        completed: false,
        category: 'sight',
      },
      {
        id: `exp-q-3`,
        text: 'Close your eyes for 60 seconds and count 3 natural sounds',
        completed: false,
        category: 'sound',
      },
      {
        id: `exp-q-4`,
        text: 'Find a fallen leaf with curious coloration and leave it on a rock',
        completed: false,
        category: 'touch',
      },
      {
        id: `exp-q-5`,
        text: 'Take one mental photograph of something in nature you normally overlook',
        completed: false,
        category: 'action',
      },
    ];

    return AiOutputValidator.validateExploreAdventure({
      title: `${groupType === 'friends' ? 'Shared' : 'Solitary'} ${timeMinutes}-min Wander`,
      timeDescription: `${timeMinutes} minutes`,
      groupType,
      theme: 'Greenery & Hidden Curiosities',
      destinations,
      quests,
      encouragement: 'Step into the fresh air. No hurry, no screens. Let the world surprise you.',
    }, timeMinutes, groupType);
  }

  async generateQuestClue(destinationName: string, destinationType: string): Promise<string> {
    return this.generateClueForPlace(destinationName, destinationType, 0);
  }

  private generateClueForPlace(_name: string, _type: string, index: number): string {
    const clues = [
      'Head toward where green branches meet the open air. Listen for rustling leaves and look for a welcoming open path.',
      'Find a place nearby where you can hear birds and see lots of trees.',
      'Seek a vantage point where you can watch the sky framed by green foliage, just a pleasant short stroll away.',
    ];
    return clues[index % clues.length];
  }

  async analyzeDiscoveryImage(imageBase64: string, _mimeType: string): Promise<ImageAnalysisResult> {
    const mockIdentifications = [
      {
        identification: 'Common Mormon Butterfly (Papilio polytes)',
        certainty: 'likely' as const,
        description: 'Looks like a Common Mormon butterfly. A classic swallowtail butterfly frequently found fluttering around gardens and open spaces.',
        interestingFact: 'Females often mimic unpalatable rose butterflies to protect themselves from hungry birds!',
        nextQuest: 'Find another butterfly with a different wing pattern or colour.',
      },
      {
        identification: 'Broadleaf Ficus or Wild Fig',
        certainty: 'likely' as const,
        description: 'Looks like a broadleaf fig specimen with glossy, thick foliage and prominent pale veins.',
        interestingFact: 'Fig trees are keystone species in many habitats, providing year-round fruit for local birds.',
        nextQuest: 'Find a plant nearby with serrated or ruffled leaves rather than smooth edges.',
      },
      {
        identification: 'Field Dandelion (Taraxacum)',
        certainty: 'likely' as const,
        description: 'Bright composite yellow ray florets characteristic of the resilient daisy family.',
        interestingFact: 'Each dandelion head is actually composed of dozens of tiny individual flowers working together.',
        nextQuest: 'Look for a dandelion that has turned into a fluffy seed sphere and make a silent wish.',
      },
      {
        identification: 'Crustose Tree Lichen',
        certainty: 'possible' as const,
        description: 'A colorful patch of lichen clinging tightly to tree bark, indicating clean outdoor air.',
        interestingFact: 'Lichen is a symbiotic partnership between fungi and algae that can survive for centuries.',
        nextQuest: 'Touch a patch of moss or tree bark with one finger to feel its natural texture.',
      },
    ];

    const sample = imageBase64 ? imageBase64.slice(0, 40) : '';
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      hash = (hash + sample.charCodeAt(i)) % mockIdentifications.length;
    }
    const chosen = mockIdentifications[hash] || mockIdentifications[0];

    return AiOutputValidator.validateImageAnalysis(chosen);
  }
}
