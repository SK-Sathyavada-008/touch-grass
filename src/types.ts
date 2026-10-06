export interface QuestItem {
  id: string;
  text: string;
  completed: boolean;
  category?: 'sight' | 'sound' | 'touch' | 'action';
  completedAt?: string;
}

export interface TenMinuteAdventure {
  title: string;
  vibe: string;
  description: string;
  durationMinutes: number;
  quests: QuestItem[];
  phoneAwayInstruction?: string;
  closingEncouragement: string;
}

export interface AdventureDestination {
  id: string;
  name: string;
  type: string;
  distance?: string;
  reasonWhyInteresting?: string;
  simpleActivity?: string;
  clue: string;
  revealed: boolean;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface ExploreAdventure {
  title: string;
  timeDescription: string;
  groupType: 'solo' | 'friends';
  theme: string;
  destinations: AdventureDestination[];
  quests: QuestItem[];
  encouragement: string;
}

export interface ActiveAdventure {
  id: string;
  type: 'ten-minute' | 'explore';
  title: string;
  description?: string;
  theme?: string;
  startedAt: string;
  quests: QuestItem[];
  destinations?: AdventureDestination[];
  currentDestinationIndex?: number;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

export interface DiscoveryItem {
  id: string;
  identification: string;
  certainty?: 'likely' | 'possible' | 'uncertain';
  confidence: string;
  explanation: string;
  funFact: string;
  nextQuest: string;
  imageUrl?: string;
  timestamp: string;
}

export type ViewState = 'home' | 'ten-minute' | 'explore' | 'quest' | 'camera' | 'progress';
