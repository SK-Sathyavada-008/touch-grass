export interface QuestItem {
  id: string;
  text: string;
  completed: boolean;
  category?: 'sight' | 'sound' | 'touch' | 'action';
}

export interface TenMinuteAdventureParams {
  timeMinutes?: number;
  groupType?: 'solo' | 'friends';
  locationContext?: string;
  weatherContext?: string;
  vibe?: string;
}

export interface TenMinuteAdventure {
  title: string;
  vibe: string;
  description: string;
  durationMinutes: number;
  quests: QuestItem[];
  phoneAwayInstruction: string;
  closingEncouragement: string; // compatibility alias
}

export interface AdventureDestination {
  id: string;
  name: string;
  type: string;
  distance?: string;
  reasonWhyInteresting: string;
  simpleActivity: string;
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

export type DiscoveryCertainty = 'likely' | 'possible' | 'uncertain';

export interface ImageAnalysisResult {
  identification: string;
  certainty: DiscoveryCertainty;
  description: string;
  interestingFact: string;
  nextQuest: string;
  confidence?: string; // natural language description
  explanation?: string; // alias for description
  funFact?: string; // alias for interestingFact
  isAmbiguous?: boolean;
  uncertaintyNote?: string;
}
