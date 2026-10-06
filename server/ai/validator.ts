import { TenMinuteAdventure, ExploreAdventure, ImageAnalysisResult, QuestItem, DiscoveryCertainty } from '../types.js';

export class AiOutputValidator {
  /**
   * Validates and normalizes 10-Minute Adventure output from Gemma
   */
  static validateTenMinuteAdventure(raw: any, defaultDuration = 10): TenMinuteAdventure {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Raw response is not a valid JSON object');
    }

    const title = typeof raw.title === 'string' && raw.title.trim().length > 0
      ? raw.title.trim()
      : 'Short Outdoor Wander';

    const vibe = typeof raw.vibe === 'string' && raw.vibe.trim().length > 0
      ? raw.vibe.trim()
      : 'Fresh Air';

    const description = typeof raw.description === 'string' && raw.description.trim().length > 0
      ? raw.description.trim()
      : 'Step outside right now. Look around for quiet details you usually pass by.';

    const rawQuests = Array.isArray(raw.quests) ? raw.quests : [];
    const validQuests: QuestItem[] = rawQuests
      .map((q: any, idx: number) => {
        const text = typeof q === 'string' ? q : q?.text ? String(q.text) : '';
        return {
          id: `quest-${Date.now()}-${idx}`,
          text: text.trim(),
          completed: false,
          category: (idx === 0 ? 'sight' : idx === 1 ? 'sound' : idx === 2 ? 'touch' : 'action') as any,
        };
      })
      .filter((q: QuestItem) => q.text.length > 0);

    // Ensure 3 to 5 quests
    const finalQuests: QuestItem[] = validQuests.length >= 3
      ? validQuests.slice(0, 5)
      : [
          ...validQuests,
          { id: `q-${Date.now()}-1`, text: 'Find something living smaller than your thumb', completed: false, category: 'sight' },
          { id: `q-${Date.now()}-2`, text: 'Stop, close your eyes, and listen for 3 distinct outdoor sounds', completed: false, category: 'sound' },
          { id: `q-${Date.now()}-3`, text: 'Feel the texture of cool stone, grass, or tree bark', completed: false, category: 'touch' },
        ].slice(0, 4);

    const phoneInstruction = typeof raw.phoneAwayInstruction === 'string' && raw.phoneAwayInstruction.trim().length > 0
      ? raw.phoneAwayInstruction.trim()
      : typeof raw.closingEncouragement === 'string' && raw.closingEncouragement.trim().length > 0
      ? raw.closingEncouragement.trim()
      : 'Now put your phone away. The fresh air is waiting right outside your door. 🌱';

    return {
      title,
      vibe,
      description,
      durationMinutes: typeof raw.durationMinutes === 'number' ? raw.durationMinutes : defaultDuration,
      quests: finalQuests,
      phoneAwayInstruction: phoneInstruction,
      closingEncouragement: phoneInstruction,
    };
  }

  /**
   * Validates and normalizes Explore Adventure output from Gemma
   */
  static validateExploreAdventure(raw: any, timeMinutes: number, groupType: 'solo' | 'friends'): ExploreAdventure {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Raw explore response is not a valid JSON object');
    }

    const title = typeof raw.title === 'string' && raw.title.trim().length > 0
      ? raw.title.trim()
      : `${groupType === 'friends' ? 'Shared' : 'Solo'} ${timeMinutes}-Minute Nature Walk`;

    const theme = typeof raw.theme === 'string' && raw.theme.trim().length > 0
      ? raw.theme.trim()
      : 'Greenery & Hidden Curiosities';

    const encouragement = typeof raw.encouragement === 'string' && raw.encouragement.trim().length > 0
      ? raw.encouragement.trim()
      : 'Step into the fresh air. No hurry, no screens. Let the world surprise you.';

    const rawDestinations = Array.isArray(raw.destinations) ? raw.destinations : [];
    const validDestinations = rawDestinations.slice(0, 3).map((d: any, idx: number) => {
      const name = typeof d.name === 'string' ? d.name.trim() : `Outdoor Spot ${idx + 1}`;
      const type = typeof d.type === 'string' ? d.type.trim() : 'park';
      const reasonWhyInteresting = typeof d.reasonWhyInteresting === 'string'
        ? d.reasonWhyInteresting.trim()
        : 'A calm place where natural life thrives in the open.';
      const simpleActivity = typeof d.simpleActivity === 'string'
        ? d.simpleActivity.trim()
        : 'Walk along the perimeter and observe changes in leaf shades.';
      const clue = typeof d.clue === 'string'
        ? d.clue.trim()
        : 'Follow the gentle rustle of leaves until the street noise softens.';

      return {
        id: `dest-${Date.now()}-${idx}`,
        name,
        type,
        distance: typeof d.distance === 'string' ? d.distance : `${(idx + 1) * 350}m away`,
        reasonWhyInteresting,
        simpleActivity,
        clue,
        revealed: false,
      };
    });

    const destinations = validDestinations.length >= 3 ? validDestinations : [
      {
        id: `dest-${Date.now()}-0`,
        name: 'Nearest Shaded Park or Green',
        type: 'park',
        distance: '300m away',
        reasonWhyInteresting: 'Canopy of leafy branches offering calm and fresh oxygen.',
        simpleActivity: 'Look for two different species of trees growing side by side.',
        clue: 'Walk toward the greenest patch of skyline nearby.',
        revealed: false,
      },
      {
        id: `dest-${Date.now()}-1`,
        name: 'Community Garden or Flowerbed',
        type: 'garden',
        distance: '600m away',
        reasonWhyInteresting: 'A vibrant patch where pollinators and colorful petals meet.',
        simpleActivity: 'Count three different colors of petals blooming quietly.',
        clue: 'Find where petals catch the direct sunlight away from cars.',
        revealed: false,
      },
      {
        id: `dest-${Date.now()}-2`,
        name: 'Solitary Tree or Quiet Clearing',
        type: 'nature',
        distance: '900m away',
        reasonWhyInteresting: 'An unhurried sanctuary to observe birds or resting insects.',
        simpleActivity: 'Stand under the branches and listen to the wind in the needles or leaves.',
        clue: 'Head toward where the trees stand tallest against the sky.',
        revealed: false,
      },
    ];

    const rawQuests = Array.isArray(raw.quests) ? raw.quests : [];
    const validQuests: QuestItem[] = rawQuests
      .map((q: any, idx: number) => {
        const text = typeof q === 'string' ? q : q?.text ? String(q.text) : '';
        return {
          id: `exp-q-${Date.now()}-${idx}`,
          text: text.trim(),
          completed: false,
          category: (idx % 2 === 0 ? 'sight' : 'sound') as any,
        };
      })
      .filter((q: QuestItem) => q.text.length > 0);

    const quests = validQuests.length >= 3 ? validQuests.slice(0, 5) : [
      { id: 'eq-1', text: 'Spot 3 different kinds of birds in the foliage', completed: false, category: 'sight' },
      { id: 'eq-2', text: 'Find 2 different wildflowers growing wild', completed: false, category: 'sight' },
      { id: 'eq-3', text: 'Close your eyes for 60 seconds and count 3 natural sounds', completed: false, category: 'sound' },
      { id: 'eq-4', text: 'Find a fallen leaf with curious coloration and leave it on a rock', completed: false, category: 'touch' },
    ];

    return {
      title,
      timeDescription: `${timeMinutes} minutes`,
      groupType,
      theme,
      destinations,
      quests,
      encouragement,
    };
  }

  /**
   * Validates and normalizes Nature Discovery Vision output from Gemma
   */
  static validateImageAnalysis(raw: any): ImageAnalysisResult {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Raw vision response is not a valid JSON object');
    }

    const identification = typeof raw.identification === 'string' && raw.identification.trim().length > 0
      ? raw.identification.trim()
      : 'Natural Wonder';

    let certainty: DiscoveryCertainty = 'likely';
    if (raw.certainty === 'possible' || raw.certainty === 'uncertain') {
      certainty = raw.certainty;
    } else if (typeof raw.confidence === 'string') {
      const lower = raw.confidence.toLowerCase();
      if (lower.includes('uncertain') || lower.includes('hard to tell') || lower.includes('unclear')) {
        certainty = 'uncertain';
      } else if (lower.includes('possible') || lower.includes('might be') || lower.includes('resembles')) {
        certainty = 'possible';
      }
    }

    const description = typeof raw.description === 'string' && raw.description.trim().length > 0
      ? raw.description.trim()
      : typeof raw.explanation === 'string' && raw.explanation.trim().length > 0
      ? raw.explanation.trim()
      : 'An interesting natural specimen found outside.';

    const interestingFact = typeof raw.interestingFact === 'string' && raw.interestingFact.trim().length > 0
      ? raw.interestingFact.trim()
      : typeof raw.funFact === 'string' && raw.funFact.trim().length > 0
      ? raw.funFact.trim()
      : 'Every living organism plays a subtle, vital part in its local ecosystem.';

    const nextQuest = typeof raw.nextQuest === 'string' && raw.nextQuest.trim().length > 0
      ? raw.nextQuest.trim()
      : 'Scan nearby: look for another leaf or flower with a contrasting shape or texture.';

    const naturalConfidence = certainty === 'likely'
      ? 'Quite likely based on distinguishing patterns'
      : certainty === 'possible'
      ? 'A possible match, though angles and light can vary'
      : 'Hard to say with certainty — nature is full of surprises';

    return {
      identification,
      certainty,
      description,
      interestingFact,
      nextQuest,
      confidence: naturalConfidence,
      explanation: description,
      funFact: interestingFact,
      isAmbiguous: certainty !== 'likely',
      uncertaintyNote: "Not completely sure? That's okay — nature is full of surprises.",
    };
  }

  /**
   * Validates quest clue string
   */
  static validateQuestClue(raw: any): string {
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
    if (raw && typeof raw.clue === 'string' && raw.clue.trim().length > 0) {
      return raw.clue.trim();
    }
    return 'Head toward where the trees meet the open sky, and listen for rustling leaves.';
  }
}
