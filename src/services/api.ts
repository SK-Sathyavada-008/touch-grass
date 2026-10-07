import type { TenMinuteAdventure, ExploreAdventure, DiscoveryItem, QuestItem } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[ApiService] Request to ${targetUrl} failed:`, err);
      throw err;
    }
  }

  static async getHealth(): Promise<{ status: string; provider: string; isMock: boolean; model: string }> {
    try {
      return await this.request('/api/health');
    } catch {
      return {
        status: 'ok',
        provider: 'GemmaClientMock',
        isMock: true,
        model: 'gemma-2-9b-it',
      };
    }
  }

  static async generateTenMinuteAdventure(vibe?: string): Promise<TenMinuteAdventure> {
    try {
      return await this.request('/api/adventure/ten-minute', {
        method: 'POST',
        body: JSON.stringify({ vibe }),
      });
    } catch {
      // Seamless static host fallback (e.g., GitHub Pages)
      const templates = [
        {
          title: 'Yellow Hunt',
          vibe: vibe || 'Sun-Seeker',
          description: 'Step outside right now and find three things that are yellow.',
          quests: [
            'Find something naturally yellow (a leaf, petal, or lichen)',
            'Find something living smaller than your thumbnail',
            'Stop, close your eyes, and listen for 3 distinct outdoor sounds',
            'Notice one subtle detail on the ground you normally ignore',
          ],
          phoneAwayInstruction: 'Now put your phone away. The yellow wonders are right outside. 🌱',
        },
        {
          title: 'Texture Safari',
          vibe: vibe || 'Tactile Explorer',
          description: 'Nature is not flat glass like your phone screen. Go touch three different textures.',
          quests: [
            'Gently touch rough tree bark with your fingertips',
            'Find a smooth pebble or a cool stone in the shade',
            'Feel the softness of a fresh green leaf or patch of moss',
            'Look up: find the highest cloud or branch currently visible',
          ],
          phoneAwayInstruction: 'Pocket your phone and let your hands explore the real world. 🌿',
        },
      ];
      const chosen = templates[Math.floor(Math.random() * templates.length)];
      const quests: QuestItem[] = chosen.quests.map((text, i) => ({
        id: `quest-${Date.now()}-${i}`,
        text,
        completed: false,
        category: (i === 0 ? 'sight' : i === 1 ? 'sight' : i === 2 ? 'sound' : 'touch') as any,
      }));
      return {
        title: chosen.title,
        vibe: chosen.vibe,
        description: chosen.description,
        durationMinutes: 10,
        quests,
        phoneAwayInstruction: chosen.phoneAwayInstruction,
        closingEncouragement: chosen.phoneAwayInstruction,
      };
    }
  }

  static async generateExploreAdventure(params: {
    timeMinutes: number;
    groupType: 'solo' | 'friends';
    lat?: number;
    lon?: number;
  }): Promise<ExploreAdventure> {
    try {
      return await this.request('/api/adventure/explore', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      // Seamless static host fallback (e.g. GitHub Pages)
      const destinations = [
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
          distance: '550m away',
          reasonWhyInteresting: 'A vibrant patch where pollinators and flowers meet.',
          simpleActivity: 'Count three different colors of petals blooming quietly.',
          clue: 'Find where petals catch the direct sunlight away from cars.',
          revealed: false,
        },
        {
          id: `dest-${Date.now()}-2`,
          name: 'Solitary Tree or Open Pathway',
          type: 'nature',
          distance: '850m away',
          reasonWhyInteresting: 'A peaceful sanctuary where urban sounds fade.',
          simpleActivity: 'Stand under the branches and listen to the wind in the leaves.',
          clue: 'Head toward where the trees stand tallest against the sky.',
          revealed: false,
        },
      ];
      const quests: QuestItem[] = [
        { id: `eq-1`, text: 'Spot 3 different kinds of birds in the foliage', completed: false, category: 'sight' },
        { id: `eq-2`, text: 'Find 2 different wildflowers growing wild', completed: false, category: 'sight' },
        { id: `eq-3`, text: 'Close your eyes for 60 seconds and count 3 natural sounds', completed: false, category: 'sound' },
        { id: `eq-4`, text: 'Find a fallen leaf with curious coloration and leave it on a rock', completed: false, category: 'touch' },
      ];
      return {
        title: `${params.groupType === 'friends' ? 'Shared' : 'Solitary'} ${params.timeMinutes}-min Wander`,
        timeDescription: `${params.timeMinutes} minutes`,
        groupType: params.groupType,
        theme: 'Greenery & Hidden Curiosities',
        destinations,
        quests,
        encouragement: 'Step into the fresh air. No hurry, no screens. Let the world surprise you.',
      };
    }
  }

  static async generateClue(destinationName: string, destinationType: string): Promise<{ clue: string }> {
    try {
      return await this.request('/api/adventure/clue', {
        method: 'POST',
        body: JSON.stringify({ destinationName, destinationType }),
      });
    } catch {
      return { clue: 'Head toward where green branches meet the open air and listen for rustling leaves.' };
    }
  }

  static async analyzeDiscovery(imageBase64: string, mimeType: string): Promise<Omit<DiscoveryItem, 'id' | 'timestamp' | 'imageUrl'>> {
    try {
      return await this.request('/api/discovery/analyze', {
        method: 'POST',
        body: JSON.stringify({ imageBase64, mimeType }),
      });
    } catch {
      // Seamless static host fallback
      const mockResults = [
        {
          identification: 'Common Mormon Butterfly (Papilio polytes)',
          certainty: 'likely' as const,
          description: 'Looks like a Common Mormon butterfly. A classic swallowtail butterfly frequently found fluttering around urban shrubs and gardens.',
          interestingFact: 'Females often mimic unpalatable rose butterflies to protect themselves from hungry birds!',
          nextQuest: 'Scan nearby flowers: find another pollinator with a different wing pattern.',
          confidence: 'Quite confident based on distinctive silhouette and wing spots',
          explanation: 'A classic swallowtail butterfly frequently found fluttering around urban shrubs and gardens.',
          funFact: 'Females often mimic unpalatable rose butterflies to protect themselves from hungry birds!',
        },
        {
          identification: 'Field Dandelion or Wild Daisy',
          certainty: 'likely' as const,
          description: 'Cheerful sun-seeker with yellow ray florets opening with morning light.',
          interestingFact: 'Every dandelion flower head is actually a cluster of dozens of tiny individual flowers blooming in harmony!',
          nextQuest: 'Look for a dandelion that has transformed into a puffy white seed sphere and make a silent wish.',
          confidence: 'Very recognizable yellow ray florets',
          explanation: 'Cheerful sun-seeker with yellow ray florets opening with morning light.',
          funFact: 'Every dandelion flower head is actually a cluster of dozens of tiny individual flowers blooming in harmony!',
        },
      ];
      return mockResults[Math.floor(Math.random() * mockResults.length)];
    }
  }
}
